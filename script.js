async function getData(url) {
    const response = await fetch(url)
    return response.json();
}

const
    source = await getData('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'),
    data = source.monthlyVariance;

//Data struture log
const format = d3.timeFormat('%B')

//Cavas || SVG Parameters
const
    height = 600,
    heightLegend = 84,
    width = 1400, 
    paddingT = 10,
    paddingR = 20,
    paddingB = 80,
    paddingL = 100;

//Chart | Data Parameters
const
    dataYearLength = d3.max(data, d => d.year) - d3.min(data, d => d.year) + 1,
    baseTemp = source.baseTemperature, //lowest Temp 1.7C, highest temp 13.9C
    barHeight = (height - heightLegend - paddingT - paddingB) / 12,
    barWidth = width / dataYearLength,
    colorRange = [
        {
            maxValue: 4,
            fill: '#0d00ff'
        },
        {
            maxValue: 5,
            fill: '#7246ff'
        },
        {
            maxValue: 6,
            fill: '#a075ff'
        },
        {
            maxValue: 7,
            fill: '#c5a2ff'
        },
        {
            maxValue: 8,
            fill: '#e4d0ff'
        },
        {
            maxValue: 9,
            fill: '#ffd9cb'
        },
        {
            maxValue: 10,
            fill: '#ffb299'
        },
        {
            maxValue: 11,
            fill: '#ff8969'
        },
        {
            maxValue: 12,
            fill: '#ff5b3a'
        },
        {
            maxValue: 99,
            fill: '#ff0000'
        }
    ]; //[colorRange.maxValue, colorRange.fill]

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', width + paddingL + paddingR)
    .attr('height', height)
    ;

const xScale = d3.scaleLinear()
    .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year)])
    .range([paddingL, paddingL + width])
    ;

const yScale = d3.scaleBand()
    .domain([
        format(new Date(2020, 0)),
        format(new Date(2020, 1)),
        format(new Date(2020, 2)),
        format(new Date(2020, 3)),
        format(new Date(2020, 4)),
        format(new Date(2020, 5)),
        format(new Date(2020, 6)),
        format(new Date(2020, 7)),
        format(new Date(2020, 8)),
        format(new Date(2020, 9)),
        format(new Date(2020, 10)),
        format(new Date(2020, 11)),
    ])
    .range([paddingT, height - heightLegend - paddingB])
    ;

//X-Axis
const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
svg.append('g')
    .attr('transform', `translate(0, ${height - heightLegend - paddingB})`)
    .attr('id', 'x-axis')
    .call(xAxis)
    .call(g => g.append('text')
        .attr('x', (paddingL + width) / 2)
        .attr('y', 40)
        .attr('fill', 'currentColor')
        .attr('class', 'label')
        .attr('text-anchor', 'start')
        .text('Years'))
    ;

//Y-Axis
const yAxis = d3.axisLeft(yScale);
svg.append('g')
    .attr('transform', `translate(${paddingL}, 0)`)
    .attr('id', 'y-axis')
    .call(yAxis)
    .call(g => g.append('text')
        .attr('x', -200)
        .attr('y', -65)
        .attr('fill', 'currentColor')
        .attr('class', 'label')
        .attr('text-anchor', 'start')
        .attr('transform', `rotate(-90)`)
        .text('Months'))
    ;

//Tooltip
let tooltip = d3.select('.canvas')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0)
    ;
const tooltipText = (data) => {
    
    return `${data.year} - ${format(new Date(data.year, data.month-1))}<br>
    ${d3.format('.1f')(baseTemp + data.variance)}&#8451 <br>
    ${d3.format('.1f')(data.variance)}&#8451`
};

//Chart
svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('data-year', d => d.year)
    .attr('data-month', d => d.month - 1)
    .attr('data-temp', d => baseTemp + d.variance)
    .attr('width', barWidth)
    .attr('height', barHeight)
    .attr('x', d => ((d.year - d3.min(data, d => d.year)) * barWidth) + paddingL)
    .attr('y', d => ((d.month - 1) * barHeight) + paddingT)
    .attr('fill', d => {
        return colorRange.find(range => range.maxValue > baseTemp + d.variance).fill
    })
    .on('mouseover', function (d, info) {
        tooltip.attr('data-year', info.year)
        tooltip.transition()
            .duration(200)
            .style('opacity', 0.8)
        tooltip.html(`${tooltipText(info)}`)
            .style('top', `${d.pageY}px`)
            .style('left', `${d.pageX + 20}px`)
    })
    .on('mouseout', function (d) {
        tooltip.transition()
            .duration(500)
            .style('opacity', 0)
    })
    ;




//Legend
const widthLegend = 400, barLegend = 40;
let dataLegend = [3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5];
const xLegend = d3.scaleLinear()
    .domain([4, 12])
    .range([0, widthLegend - 80])
    ;
const axisLegend = d3.axisBottom(xLegend).tickFormat(d3.format('.1f'))
svg.append('g')
    .attr('transform', `translate(${paddingL + 40}, ${height - heightLegend})`)
    .call(axisLegend)
    ;

svg.append('g')
    .attr(`transform`, `translate(${paddingL}, ${height - heightLegend - barLegend})`)
    .attr('id', 'legend')
    .call(g => g.selectAll('rect')
        .data(dataLegend)
        .enter()
        .append('rect')
        .attr('width', barLegend)
        .attr('height', barLegend)
        .attr('x', (d, i) => i * 40)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('fill', d => {
            return colorRange.find(range => range.maxValue > d).fill
        }))
    ;

svg.select('#legend path.domain') //extending the legend's path
    .attr('d', () => { return `M-39.95,6V0.5H360.5V6` })

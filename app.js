document.addEventListener("DOMContentLoaded", function() {
  const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
  const width = 1800;
  const height = 800;
  const margin = { top: 40, left: 140, bottom: 80, right: 0 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const title = "Monthly Global Land-Surface Temperature";
  let description = ": base temperature"
  const yearSpecifier  = "%Y";
  const monthSpecifier = "%B"
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const colors = [ "rgb(49, 54, 149)",
                   "rgb(69, 117, 180)" ,
                   "rgb(116, 173, 209)",
                   "rgb(171, 217, 233)",
                   "rgb(224, 243, 248)",
                   "rgb(255, 255, 191)",
                   "rgb(254, 224, 144)",
                   "rgb(253, 174, 97)",
                   "rgb(244, 109, 67)",
                   "rgb(215, 48, 39)",
                   "rgb(165, 0, 38)"
                 ]

  d3.queue()
    .defer(d3.json, url)
    .await((error, response) => {
      let baseTemperature = response.baseTemperature;
      let data = response.monthlyVariance; // [{year: 1753,, month: 1, variance: -1.366}, {}, ...]
      let minYear = d3.min(data, d => d.year);
      let maxYear = d3.max(data, d => d.year);
      let minTemp = (d3.min(data, d => d.variance) + baseTemperature).toFixed(1);
      let maxTemp = (d3.max(data, d => d.variance) + baseTemperature).toFixed(1);
      let tempArr = [
        2.7934545454545456, 3.902909090909091, 5.012363636363636, 
        6.121818181818182, 7.231272727272727, 8.340727272727273, 
        9.45018181818181810, 10.559636363636365, 11.669090909090908, 
        12.778545454545455
      ]      
      
      //setup svg
      let svg = d3.select("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .classed("svg", true);

      //add title
      d3.select("#title")
        .classed("title", true)
        .text(title);

      //add description
      description = `${minYear} - ${maxYear}${description} ${baseTemperature}℃`;
      d3.select("#description")
        .classed("description", true)
        .text(description);

      //setup scales
      let xScale = d3.scaleTime()
                     .domain([d3.timeParse(yearSpecifier)(minYear), d3.timeParse(yearSpecifier)(maxYear)])
                     .range([margin.left, innerWidth]);      

      let yScale = d3.scaleBand()
                     .domain(months)                    
                     .range([margin.top, innerHeight]);

      let colorScale = d3.scaleQuantize()
                         .domain(d3.extent(data, d => baseTemperature + d.variance))
                         .range(colors);

      let legendXScale = d3.scaleLinear()
                           .domain([minTemp, maxTemp])
                           .range([margin.left, 600])

      let legendColorScale = d3.scaleThreshold()
                               .domain(tempArr)
                               .range(colors);

      //setup axis
      let xAxis = d3.axisBottom(xScale)                    
                    .tickFormat(d3.timeFormat("%Y"))
                    .ticks(d3.timeYear.every(10))
                    .tickSizeOuter(0)

      let yAxis = d3.axisLeft(yScale)
                    .tickSizeOuter(0)

      let legendAxis = d3.axisBottom(legendXScale)
                         .tickSize(10, 0)
                         .tickValues(tempArr)
                         .tickFormat(d3.format(".1f"))
                         .tickSizeOuter(0);

      //add axis
      svg
        .append("g")
          .attr("id", "x-axis")
        .call(xAxis)
          .attr("transform", `translate(0,${innerHeight})`)
          .style("font-size", "14")

      svg
        .append("g")
          .attr("id", "y-axis")
        .call(yAxis)
          .attr("transform", `translate(${margin.left-0.5},0)`)
          .style("font-size", "14")

      let legend = svg
                      .append("g")
                        .attr("id", "legend")
      legend
        .append("g")
          .attr("id", "legend-axis")
        .call(legendAxis)
          .attr("transform", `translate(0, ${height - 50})`)
          .style("font-size", "14")

      //add legend
      legend
        .append("g")
        .selectAll("rect")
        .data([
          minTemp,
          2.7934545454545456, 3.902909090909091, 5.012363636363636, 
          6.121818181818182, 7.231272727272727, 8.340727272727273, 
          9.45018181818181810, 10.559636363636365, 11.669090909090908, 
          12.778545454545455
        ])
        .enter()
        .append("rect")
        .classed("color-box", true)
          .attr("x", function(d) {return legendXScale(d); })
          .attr("y", height - 80)
          .attr("width", (600-margin.left)/11)
          .attr("height", 30)
          .style("fill", d => legendColorScale(d))

      //axis label
      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("x", margin.top-300)
        .attr("y", margin.left/2)
        .text("Months")
        .style("font-weight", "600")

        svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", innerHeight + 40)
        .text("Years")
        .style("font-weight", "600")        

      // tooltip
      let tooltip = d3.select("body")                    
                      .append("div")
                        .attr("id", "tooltip")                        
                        .classed("tooltip", true);
      
      //draw rects
      svg
        .selectAll(".cell")
        .data(data)
        .enter()
        .append("rect")
        .classed("cell", true)
          .attr("data-month", d => d.month-1)
          .attr("data-year", d => d.year)
          .attr("data-temp", d => d.variance+baseTemperature)
          .attr("x", d => xScale(d3.timeParse(yearSpecifier)(d.year)))
          .attr("y", d => yScale(months[d.month-1]))
          .attr("width", 6)
          .attr("height", yScale.bandwidth())
          .style("fill", d => colorScale(d.variance+baseTemperature))
        .on("mouseover", showTooltip)
        .on("touchstart", showTooltip)
        .on("mouseout", hideTooltip)    
        .on("touchend", hideTooltip);

        function showTooltip(d) {
          let year = d.year;
          let month = months[d.month-1];
          let temperature = baseTemperature + d.variance;
          let variance = d.variance;

          d3.select(this).classed("highlight", true);

          tooltip
            .attr("data-year", year)
            .style("opacity", 1)
            .style("left", `${d3.event.x - tooltip.node().offsetWidth/2}px`)
            .style("top", `${d3.event.y + 25}px`)
            .html(`
              <p>${year} - ${month}</p>
              <p>${temperature}</p>
              <p>${variance}</p>
            `);          
        }
  
        function hideTooltip() {
          d3.select(this).classed("highlight", false);
          tooltip
            .style("opacity", 0);
        } 
    });
});
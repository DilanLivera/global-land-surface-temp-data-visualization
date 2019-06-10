document.addEventListener("DOMContentLoaded", function() {
  const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
  const width = 1800;
  const height = 800;
  const margin = { top: 40, left: 180, bottom: 80, right: 0 };
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
                     .range([margin.top, innerHeight])


      let colorScale = d3.scaleQuantize()
                         .domain(d3.extent(data, d => baseTemperature + d.variance))
                         .range(colors);
                        //  .interpolator(d3.interpolateSpectral);
      
      //setup axis
      let xAxis = d3.axisBottom(xScale)                    
                    .tickFormat(d3.timeFormat("%Y"))
                    .ticks(d3.timeYear.every(10))
                    .tickSizeOuter(0)

      let yAxis = d3.axisLeft(yScale)
                    .tickSizeOuter(0)
                    
                    
                    // .tickFormat(d3.timeFormat("%B"))
                    // .tickPadding(10)

      //add axis
      svg.append("g")
           .attr("id", "x-axis")
         .call(xAxis)
           .attr("transform", `translate(0,${innerHeight})`)
         .selectAll("text")
         .style("font-size", "14")

      svg.append("g")
           .attr("id", "y-axis")
         .call(yAxis)
           .attr("transform", `translate(${margin.left-0.5},0)`)
         .style("font-size", "14")
      
      //draw rects
      svg
        .selectAll(".cell")
        .data(data)
        .enter()
        .append("rect")
        .classed("cell", true)
          .attr("data-month", d => d.month)
          .attr("data-year", d => d.year)
          .attr("data-temp", d => d.variance+baseTemperature)
          .attr("x", d => xScale(d3.timeParse(yearSpecifier)(d.year)))
          .attr("y", d => yScale(months[d.month-1]))
          .attr("width", xScale.length*7)
          .attr("height", yScale.bandwidth())
          .style("fill", d => colorScale(d.variance+baseTemperature))
    });
});
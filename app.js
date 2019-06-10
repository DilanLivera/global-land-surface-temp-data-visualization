document.addEventListener("DOMContentLoaded", function() {
  const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
  const width = 1500;
  const height = 800;
  const title = "Monthly Global Land-Surface Temperature";
  let description = ": base temperature"

  d3.queue()
    .defer(d3.json, url)
    .await((error, response) => {
      let baseTemperature = response.baseTemperature;
      let data = response.monthlyVariance; // [{year, month, variance}, {}, ...]
      let minYear = d3.min(data, d => d.year);
      let maxYear = d3.max(data, d => d.year);
      
      //setup svg
      d3.select("svg")
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
    });
});
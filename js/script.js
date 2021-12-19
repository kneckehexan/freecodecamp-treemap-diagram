document.addEventListener("DOMContentLoaded", function () {
  fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
  )
    .then((res) => res.json())
    .then((res) => createChart(res))
    .catch((error) => console.error(error.message));

  function createChart(data) {
    // Variables and constants
    const W = 1000;
    const H = 900;
    const PADDING = 60;
    console.log(data);

    // Title text and description
    d3.select("#title").text(data.name);
    d3.select("#description").html(
      "Top 100 most sold video games grouped by Platform"
    );

    // Create the canvas
    const svg = d3
      .select(".chartContainer")
      .append("svg")
      .attr("width", W)
      .attr("height", H);

    // Initilaize tooltip
    var tooltip = d3
      .select(".chartContainer")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    // Create the hierarchy
    var hierarchy = d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    // Create treemap
    var treemap = d3
      .treemap()
      .size([W - PADDING, H - PADDING * 2])
      .padding(1);

    // Pass data to treemap
    var root = treemap(hierarchy);
    console.log(root);

    // Color scale
    var categories = data.children.map((d) => d.name);
    console.log(categories);
    var colorScale = d3
      .scaleOrdinal()
      .domain(categories)
      .range(colorbrewer.Spectral[11]);

    // Ceate the graphical elements for the svg
    var tree = svg.selectAll("g").data(root.leaves()).enter().append("g");

    tree
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => colorScale(d.data.category))
      .attr("class", "tile")
      .attr("data-name", (d) => d.data.name)
      .attr("data-category", (d) => d.data.category)
      .attr("data-value", (d) => d.data.value)
      .on("mouseover", (i, d) => {
        tooltip
          .transition()
          .duration(0)
          .style("left", i.pageX + 10 + "px")
          .style("top", i.pageY - 25 + "px")
          .style("opacity", 0.9);
        tooltip
          .attr("data-value", d.value)
          .attr("id", "tooltip")
          .html(
            "Platform: " +
              d.data.category +
              "<br>" +
              "Game: " +
              d.data.name +
              "<br>" +
              "Value: " +
              d.value
          );
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    tree
      .append("text")
      .selectAll("tspan")
      .data((d) => {
        return d.data.name.split(/(?=[A-Z][^A-Z])/g).map((v) => {
          return { text: v, x0: d.x0, y0: d.y0 };
        });
      })
      .enter()
      .append("tspan")
      .attr("x", (d) => d.x0 + 5)
      .attr("y", (d, i) => d.y0 + 15 + i * 10)
      .text((d) => d.text)
      .attr("font-size", "0.6em");

    // Legend
    var legend = svg.append("g").attr("id", "legend");
    var legendWidth = W;
    const LEGEND_OFFSET = H - PADDING - 20;
    const LEGEND_RECT_SIZE = 15;
    const LEGEND_H_SPACING = 150;
    const LEGEND_V_SPACING = 10;
    const LEGEND_TEXT_X_OFFSET = 3;
    const LEGEND_TEXT_Y_OFFSET = -2;
    var legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);

    var legendElem = legend
      .append("g")
      .attr("transform", "translate(60," + LEGEND_OFFSET + ")")
      .selectAll("g")
      .data(categories)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        return (
          "translate(" +
          (i % legendElemsPerRow) * LEGEND_H_SPACING +
          "," +
          (Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
            LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) +
          ")"
        );
      });

    legendElem
      .append("rect")
      .attr("width", LEGEND_RECT_SIZE)
      .attr("height", LEGEND_RECT_SIZE)
      .attr("class", "legend-item")
      .attr("fill", (d) => colorScale(d));

    legendElem
      .append("text")
      .attr("x", LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
      .attr("y", LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
      .text((d) => d);
  }
});

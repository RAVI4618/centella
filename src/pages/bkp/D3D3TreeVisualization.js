import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
 // Adjust the import path based on your project structure

const D3TreeVisualization = ({ data }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(d3Container.current);
    svg.selectAll("*").remove(); // Clear SVG for redraw

    const margin = { top: 20, right: 90, bottom: 30, left: 90 },
          width = 960 - margin.right - margin.left,
          height = 500 - margin.top - margin.bottom;

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([height, width]);
    treeLayout(root);

    // Draw links
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x))
      .style("stroke", "#ccc");

    // Draw nodes
    const node = g.selectAll(".node")
                  .data(root.descendants())
                  .enter().append("g")
                  .attr("class", "node")
                  .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("r", 10)
        .style("fill", "white")
        .style("stroke", "steelblue");

    // Add SmileViewer for nodes with SMILES
    node.filter(d => d.data.smiles)
        .append("foreignObject")
        .attr("width", 100)
        .attr("height", 100)
        .attr("x", -50)
        .attr("y", -50)
        .html(d => `<div><SmileViewer smileString="${d.data.smiles}" id="smile_${d.data.smiles}" imgwidth="100" imgheight="100" /></div>`);

    // Add labels
    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);

  }, [data]); // Dependency array ensures effect runs when data changes

  return <svg ref={d3Container} width="1000" height="600"></svg>;
};

export default D3TreeVisualization;

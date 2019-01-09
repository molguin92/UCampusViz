d3.select("body").append("svg");
d3.json('https://raw.githubusercontent.com/molguin92/UCampusParser/master/graph.json', function (data) {
    console.log(data); // this is your data
    nodes = data.nodes;
    links = data.links;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height);

    function getNodeColor(node) {
        return node.level === 1 ? 'red' : 'gray'
    }

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-20))
        .force('center', d3.forceCenter(width / 2, height / 2));

    const nodeElements = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', 10)
        .attr('fill', getNodeColor);

    const textElements = svg.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .text(node => node.label)
        .attr('font-size', 15)
        .attr('dx', 15)
        .attr('dy', 4);
});

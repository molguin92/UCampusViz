const width = 0.95 * window.innerWidth,
    height = 0.95 * window.innerHeight;

const offset_top = (window.innerHeight - height) / 2,
    offset_side = (window.innerWidth - width) / 2;

const zoom = d3.zoom().on('zoom', function () {
});

const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append("g")
    .attr("transform", "translate(" + offset_top + "," + offset_side + ")");

svg.append('defs').append('marker')
    .attrs({
        'id': 'arrowhead',
        'viewBox': '-0 -5 10 10',
        'refX': 20,
        'refY': 0,
        'orient': 'auto',
        'markerWidth': 7,
        'markerHeight': 7,
        'xoverflow': 'visible'
    })
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#999')
    .style('stroke', 'none');

const rect = svg.append("rect")
    .attr("width", width * 5)
    .attr("height", height * 5)
    .style("fill", "none")
    .style("pointer-events", "all");

const linkforce = d3.forceLink()
    .id(function (link) {
        return link.id;
    })
    .strength(1);

const simulation = d3.forceSimulation()
    .velocityDecay(.9)
    .force('link', linkforce)
    .force('charge', d3.forceManyBody().strength(-5))
    .force('center', d3.forceCenter(width / 2, height / 2));

const container = svg.append("g");
const colors = ["#cca15d",
    "#5c74e1",
    "#adb92f",
    "#b259d0",
    "#64c04c",
    "#c74caa",
    "#4c8b29",
    "#7d5ac0",
    "#d9a02c",
    "#637fc3",
    "#cc4e27",
    "#48b1da",
    "#d73e4a",
    "#5ebd7b",
    "#da3e7f",
    "#55c8b0",
    "#9b4467",
    "#a4b657",
    "#8f5898",
    "#887e22",
    "#c993dd",
    "#3c7e48",
    "#de7faa",
    "#389781",
    "#dd8140",
    "#616727",
    "#bb555a",
    "#99a260",
    "#e28c7b",
    "#975c2a"];

let colormapping = {};

d3.json('https://raw.githubusercontent.com/molguin92/UCampusParser/master/graph.json')
    .then(function (data) {

        const links = container.append('g')
            .selectAll('line')
            .data(data.links)
            .enter().append('line')
            .attr("class", "link")
            .attr('stroke-width', 1)
            .attr('stroke', '#E5E5E5')
            .attr('marker-end', 'url(#arrowhead)');

        const nodes = container.append("g")
            .attr("class", "dot")
            .selectAll("circle")
            .data(data.nodes)
            .enter().append("circle")
            .attr('id', function (d) {
                return d.id;
            })
            .attr('dept', function (d) {
                return d.dept;
            })
            .attr("r", 5)
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .attr("fill", function (d, i) {
                if (!(d.dept in colormapping)) {
                    let idx = Object.keys(colormapping).length;
                    colormapping[d.dept] = colors[idx];
                }

                return colormapping[d.dept];
            });

        simulation.nodes(data.nodes).on('tick', () => {
                nodes
                    .attr('cx',
                        node => node.x
                    )
                    .attr('cy',
                        node => node.y
                    )
                    .attr('x',
                        node => node.x
                    )
                    .attr('y',
                        node => node.y
                    );

                links.attr('x1', link => link.source.x)
                    .attr('y1', link => link.source.y)
                    .attr('x2', link => link.target.x)
                    .attr('y2', link => link.target.y);

                simulation.force("link").links(data.links);
            }
        );
    });

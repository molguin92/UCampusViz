const width = 0.95 * window.innerWidth,
    height = 0.95 * window.innerHeight;

const offset_top = (window.innerHeight - height) / 2,
    offset_side = (window.innerWidth - width) / 2;

function calculate_radius(c) {
    return c.dep_factor + 5;
}

const drag = d3.drag()
    .on('start', function (d) {
        if (!d3.event.active) simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
    })
    .on('drag', function (d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    })
    .on('end', function (d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    });


const svg = d3.select('body')
    .append('svg')
    .call(d3.zoom().on('zoom', function () {
        svg.attr('transform', d3.event.transform)
    }))
    .attr('width', width)
    .attr('height', height)
    .style('display', 'block')
    .style('margin', 'auto')
    .append('g')
    .attr('transform', 'translate(' + offset_top + ',' + offset_side + ')');

svg.append('defs').append('marker')
    .attrs({
        'id': 'arrowhead',
        'viewBox': '-0 -5 10 10',
        'refX': 5,
        'refY': 0,
        'orient': 'auto',
        'markerWidth': 4,
        'markerHeight': 4,
        'xoverflow': 'visible'
    })
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#000')
    .style('stroke', 'none');

const linkforce = d3.forceLink()
    .id(function (endpoint) {
        return endpoint.id;
    })
    .distance(function (link) {
        let dist = 100;
        if (link.source.dept === link.target.dept)
            dist = 25;

        return calculate_radius(link.target) + calculate_radius(link.source) + dist;
    });

let default_force = linkforce.strength();

// set linkforce strength
linkforce.strength(function (link) {
    let force_factor = 0.5;
    if (link.source.dept === link.target.dept)
        force_factor = 3;
    return default_force(link) * force_factor;
});

const collision = d3.forceCollide()
    .radius((d) => calculate_radius(d) + 4)
    .strength(1);

const manybody = d3.forceManyBody()
    .strength(function (node) {
        return -1 * calculate_radius(node) - 40;
    })
    .distanceMax(1000);

const simulation = d3.forceSimulation()
    .velocityDecay(.7)
    .force('collision', collision)
    .force('link', linkforce)
    .force('charge', manybody)
    .force('center', d3.forceCenter(width / 2, height / 2));

const default_alpha_decay = simulation.alphaDecay();
simulation.alphaDecay(default_alpha_decay / 3);

const container = svg.append('g');
const colors = [
    "#d76d31",
    "#536bd8",
    "#5ab74e",
    "#8d4ec3",
    "#a3b24b",
    "#af389e",
    "#4fb694",
    "#de4ea6",
    "#577a37",
    "#d873de",
    "#d1a033",
    "#a37bdd",
    "#92632b",
    "#8397dd",
    "#ca4035",
    "#46aed7",
    "#dd3c6d",
    "#5263a5",
    "#d59f65",
    "#935892",
    "#e07f76",
    "#d38fcc",
    "#a54a57",
    "#e379a1",
    "#a83b74"
];

let colormapping = {};

function show_graph(data_nodes, data_links) {
    const links = container.append('g')
        .selectAll('path')
        .data(data_links)
        .enter().append('path')
        .attr('class', 'link')
        .attr('source', function (d) {
            return d.source;
        })
        .attr('target', function (d) {
            return d.target;
        })
        .attr('stroke-width', 1)
        .attr('stroke', '#E5E5E5')
        .attr('marker-end', 'url(#arrowhead)')
        .style('fill', 'none')
        .style('stroke', '#000')
        .style('stroke-width', '.7px');

    const node_anchors = container.append('g')
        .attr('class', 'dot')
        .selectAll(null)
        .data(data_nodes)
        .enter().append('g');

    const nodes = node_anchors.append('circle')
        .attr('id', function (d) {
            return d.id;
        })
        .attr('dept', function (d) {
            return d.dept;
        })
        .attr('r', calculate_radius)
        .attr('cx', function (d) {
            return d.x;
        })
        .attr('cy', function (d) {
            return d.y;
        })
        .attr('fill', function (d) {
            if (!(d.dept in colormapping)) {
                let idx = Object.keys(colormapping).length;
                colormapping[d.dept] = colors[idx];
            }

            return colormapping[d.dept];
        })
        .call(drag)
        .on('click', function (d) {



        });

    const node_labels = node_anchors
        .each(function (d) {
            if (d.dep_factor < 20) return;

            d3.select(this)
                .append('text')
                .text(d.id)
                .attr('x', 0)
                .attr('y', 0)
                .attr('color', 'black')
                .attr('font-size', 15)
                .style('text-anchor', 'middle');
        });

    simulation.nodes(data_nodes).on('tick', () => {
            node_anchors
                .each(function (node) {
                    d3.select(this).selectAll('circle')
                        .attr('cx', node.x)
                        .attr('cy', node.y)
                        .attr('x', node.x)
                        .attr('y', node.y);

                    d3.select(this).selectAll('text')
                        .attr('x', node.x)
                        .attr('y', node.y + 5);
                });

            links.attr('d', function (d) {
                const dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);

                const offsetX = (dx * (calculate_radius(d.target) + 1)) / dr,
                    offsetY = (dy * (calculate_radius(d.target) + 1)) / dr;

                return 'M' +
                    d.source.x + ',' + d.source.y +
                    ' ' + (d.target.x - offsetX) + ',' + (d.target.y - offsetY);
                //' ' + d.target.x + ',' + d.target.y;
            });

            simulation.force('link').links(data_links);
        }
    );
}

d3.json('https://raw.githubusercontent.com/molguin92/UCampusParser/master/graph.json')
    .then(d => show_graph(d.nodes, d.links));

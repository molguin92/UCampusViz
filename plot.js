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
    .id(function (link) {
        return link.id;
    })
    .strength(.8);

const collision = d3.forceCollide()
    .radius(calculate_radius);

const simulation = d3.forceSimulation()
    .velocityDecay(.7)
    .force('collision', collision)
    .force('link', linkforce)
    .force('charge', d3.forceManyBody().strength(-40))
    .force('center', d3.forceCenter(width / 2, height / 2));

const container = svg.append('g');
const colors = ['#cca15d',
    '#5c74e1',
    '#adb92f',
    '#b259d0',
    '#64c04c',
    '#c74caa',
    '#4c8b29',
    '#7d5ac0',
    '#d9a02c',
    '#637fc3',
    '#cc4e27',
    '#48b1da',
    '#d73e4a',
    '#5ebd7b',
    '#da3e7f',
    '#55c8b0',
    '#9b4467',
    '#a4b657',
    '#8f5898',
    '#887e22',
    '#c993dd',
    '#3c7e48',
    '#de7faa',
    '#389781',
    '#dd8140',
    '#616727',
    '#bb555a',
    '#99a260',
    '#e28c7b',
    '#975c2a'];

let colormapping = {};

d3.json('https://raw.githubusercontent.com/molguin92/UCampusParser/master/graph.json')
    .then(function (data) {

        data_nodes = data.nodes.filter(function (d) {
            return d.id.substring(0, 2) === 'CC';
        });

        data_links = data.links.filter(function (d) {
            return d.source.substring(0, 2) === 'CC' & d.target.substring(0, 2) === 'CC';
        });

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

        const nodes = container.append('g')
            .attr('class', 'dot')
            .selectAll('circle')
            .data(data_nodes)
            .enter().append('circle')
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
            .attr('fill', function (d, i) {
                if (!(d.dept in colormapping)) {
                    let idx = Object.keys(colormapping).length;
                    colormapping[d.dept] = colors[idx];
                }

                return colormapping[d.dept];
            })
            .call(drag);

        simulation.nodes(data_nodes).on('tick', () => {
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
    });

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
    .force('link', linkforce)
    .force('charge', d3.forceManyBody().strength(-20))
    .force('center', d3.forceCenter(width / 2, height / 2));

const container = svg.append("g");

d3.json('https://raw.githubusercontent.com/molguin92/UCampusParser/master/graph.json')
    .then(function (data) {

        const links = container.append('g')
            .selectAll('line')
            .data(data.links)
            .enter().append('line')
            .attr('stroke-width', 1)
            .attr('stroke', '#E5E5E5');

        const nodes = container.append("g")
            .attr("class", "dot")
            .selectAll("circle")
            .data(data.nodes)
            .enter().append("circle")
            .attr('id', function (d) {
                return d.id;
            })
            .attr("r", 5)
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
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

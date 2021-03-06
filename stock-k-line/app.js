// https://www.alphavantage.co/documentation/
let key = "M07UZ87OXNYQ2ZK9";
let query = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=NVDA&outputsize=compact&datatype=csv&apikey=M07UZ87OXNYQ2ZK9"

let svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const parseTime = d3.timeParse("%Y-%m-%d");

const x = d3.scaleTime()
    .rangeRound([0, width]);

const y = d3.scaleLinear()
    .rangeRound([height, 0]);

const area_gen = d3.area()
    .x(d => x(d.timestamp))
    .y0(d => y(d.open))
    .y1(d => y(d.close))
    ;

// https://github.com/d3/d3-shape#lines
const line_gen = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.open))
    // .y1(d => y(d.close))
    // .curve(d3.curveCatmullRom)
    ;

// https://github.com/d3/d3-request#json
d3.json("config.json", (error, config_json) => {
    if (error) throw error;
    if (config_json.debug == 1) {
        query = "cache/daily_NVDA.csv";
    }

    // https://github.com/d3/d3-request#csv
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions
    const row_fn = d => {
      d.timestamp = parseTime(d.timestamp);
      d.open = +d.open;
      d.close = +d.close;
      d.volume = +d.volume;
      return d;
    };

    const load_fn = (error, data) => {
      if (error) throw error;

      x.domain(d3.extent(data, d => d.timestamp));
      y.domain([0, d3.max(data, d => d.close)]);
      // area.y0(y(0));

      g.append("path")
          .datum(data)
          .attr("fill", "steelblue")
          .attr("d", line_gen);

      g.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      g.append("g")
          .call(d3.axisLeft(y))
        .append("text")
          .attr("fill", "#000")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Price ($)");
    };
    d3.csv(query, row_fn, load_fn);    
})
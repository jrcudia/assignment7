import React, { Component } from "react";
import * as d3 from "d3";

class Child1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colorBy: 'sentiment',
      selectedTweets: []
    };
  }

  componentDidMount() {
    if (this.props.tweet_data.length > 0) {
      this.renderDashboard();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.tweet_data !== this.props.tweet_data) {
      this.renderDashboard();
    }

    if (prevState.colorBy !== this.state.colorBy) {
      this.updateColors();
    }
  }

  renderDashboard() {
    const data = this.props.tweet_data;

    if (!data || data.length === 0) {
      d3.select('.container').selectAll("*").remove();
    }

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 30, left: 20 };

    const container = d3.select('.container')
      .attr('width', width)
      .attr('height', height);

    const sentimentColorScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);

    const subjectivityColorScale = d3.scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

    const months = ["March", "April", "May"];

    const monthPositions = {
      "March": height * 0.20,
      "April": height * 0.50,
      "May": height * 0.80
    };

    const nodes = data.map(d => ({
      ...d,
      x: width / 2,
      y: monthPositions[d.Month]
    }));

    const simulation = d3.forceSimulation(nodes)
      .force("x", d3.forceX(width / 2))
      .force("y", d3.forceY(d => monthPositions[d.Month]).strength(2))
      .force("collide", d3.forceCollide(7));


    const circles = container.selectAll("circle")
      .data(nodes, d => d.idx)
      .join("circle")
      .attr("r", 6)
      .attr("fill", d => this.state.colorBy === 'sentiment' ?
        sentimentColorScale(d.Sentiment) :
        subjectivityColorScale(d.Subjectivity))
      .attr('stroke', 'black')
      .attr('stroke-width', 0)
      .on("click", (event, d) => {
        this.handleTweetClick(d)
      });


    simulation.on("tick", () => {
      circles
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    container.selectAll('.month-label')
      .data(months)
      .join('text')
      .attr('class', 'month-label')
      .attr('x', margin.left)
      .attr('y', d => monthPositions[d])
      .text(d => d)
      .style('font-size', 18)
      .style('font-weight', 'bold')

    const sequentialSentimentScale = d3.scaleSequential()
      .domain([0, 25])
      .interpolator(d3.piecewise(["red", "#ECECEC", "green"]));

    const sequentialSubjectivityScale = d3.scaleSequential()
      .domain([0, 25])
      .interpolator(d3.piecewise(["#ECECEC", "#4467C4"]));


    const legendHeight = 250;
    const legendWidth = 20;

    const legend = container.selectAll(".legend")
      .data([null])
      .join("g")
      .attr("class", "legend")
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top + 50})`);


    legend.selectAll("rect")
      .data(d3.range(0, 25))
      .join("rect")
      .attr("x", 0)
      .attr("y", d => legendHeight - (d * legendHeight / 25))
      .attr("width", legendWidth)
      .attr("height", 12)
      .attr("fill", d => this.state.colorBy === 'sentiment' ?
        sequentialSentimentScale(d) :
        sequentialSubjectivityScale(d));

    legend.selectAll('.legend-label-top')
      .data([null])
      .join('text')
      .attr('class', 'legend-label-top')
      .attr('x', 25)
      .attr('y', 20)
      .text(() => this.state.colorBy === 'sentiment' ?
        'Positive' :
        'Subjective'
      )

    legend.selectAll('.legend-label-bottom')
      .data([null])
      .join('text')
      .attr('class', 'legend-label-bottom')
      .attr('x', 25)
      .attr('y', legendHeight + 10)
      .text(() => this.state.colorBy === 'sentiment' ?
        'Negative' :
        'Objective'
      )

  }

  updateColors = () => {
    const container = d3.select('.container');
    const legend = container.selectAll(".legend")

    const sentimentColorScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "#ECECEC", "green"]);

    const subjectivityColorScale = d3.scaleLinear()
      .domain([0, 1])
      .range(["#ECECEC", "#4467C4"]);

    const sequentialSentimentScale = d3.scaleSequential()
      .domain([0, 25])
      .interpolator(d3.piecewise(["red", "#ECECEC", "green"]));

    const sequentialSubjectivityScale = d3.scaleSequential()
      .domain([0, 25])
      .interpolator(d3.piecewise(["#ECECEC", "#4467C4"]));

    container.selectAll("circle")
      .attr("fill", d => this.state.colorBy === 'sentiment' ?
        sentimentColorScale(d.Sentiment) :
        subjectivityColorScale(d.Subjectivity));

    legend.selectAll("rect")
      .attr("fill", d => this.state.colorBy === 'sentiment' ?
        sequentialSentimentScale(d) :
        sequentialSubjectivityScale(d));

    legend.selectAll('.legend-label-top')
      .text(() => this.state.colorBy === 'sentiment' ?
        'Positive' :
        'Subjective'
      )

    legend.selectAll('.legend-label-bottom')
      .text(() => this.state.colorBy === 'sentiment' ?
        'Negative' :
        'Objective'
      )
  }

  handleTweetClick = (tweet) => {
    this.setState(prevState => {
      const isSelected = prevState.selectedTweets.find(d => d.idx === tweet.idx);
      if (isSelected) {
        d3.select('.container').selectAll('circle').filter(d => d.idx === tweet.idx)
          .attr('stroke-width', 0);
        return {
          selectedTweets: prevState.selectedTweets.filter(d => d.idx !== tweet.idx)
        };
      }
      d3.select('.container').selectAll('circle').filter(d => d.idx === tweet.idx)
        .attr('stroke-width', 3);
      return {
        selectedTweets: [tweet, ...prevState.selectedTweets]
      };
    });
  }

  render() {
    return (
      <div className="child1">
        {this.props.tweet_data.length !== 0 &&
          <div style={{ fontWeight: 'bold', marginLeft: 20 }}>
            <label>Color By: </label>
            <select
              value={this.state.colorBy}
              onChange={(e) => this.setState({ colorBy: e.target.value })}
            >
              <option value="sentiment">Sentiment</option>
              <option value="subjectivity">Subjectivity</option>
            </select>
          </div>}
        <svg className="container"></svg>
        <div style={{ marginTop: 20, marginLeft: 20, marginRight: 20 }}>
          {this.state.selectedTweets.map((tweet, i) => (
            <div key={tweet.idx}>
              <p>{tweet.RawTweet}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Child1;
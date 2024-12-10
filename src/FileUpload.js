import React, { Component } from 'react';

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      jsonData: null,  // New state to store the parsed JSON data
    };
  }
  
  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.parseJson(text);
        const limitedData = json.slice(0, 300);  // Limit to first 300 tweets
        this.setState({ jsonData: limitedData });  // Set JSON to state
        this.props.set_data(limitedData)
      };
      reader.readAsText(file);
    }
  };

  parseJson = (text) => {
    try {
      const data = JSON.parse(text);
      const result = [];

      // If data is an array, process each item
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item && item.RawTweet) {
            const parsedObj = {
              idx: item.idx,
              Month: item.Month,
              RawTweet: item.RawTweet,
              Dimension1: parseFloat(item["Dimension 1"]),
              Dimension2: parseFloat(item["Dimension 2"]),
              Sentiment: parseFloat(item.Sentiment),
              Subjectivity: parseFloat(item.Subjectivity)
            };
            result.push(parsedObj);
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a JSON File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input type="file" accept=".json" onChange={(event) => this.setState({ file: event.target.files[0] })} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;
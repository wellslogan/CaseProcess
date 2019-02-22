import * as React from 'react';
import { saveAs } from 'file-saver';

import { Upload } from './upload';
import processDocxAsync from './processDocs';

type State = {
  error?: string;
  files: File[];
};

class App extends React.Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = { files: [] };
  }

  handleSubmit() {
    this.setState({ error: '' }, async () => {
      const csvBlob = await processDocxAsync(this.state.files);
      saveAs(csvBlob, this.state.files[0].name.replace(/\.docx$/, '.csv'));
    });
  }

  handleFileDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length) {
      return this.setState({ error: 'Only DOCX files allowed.' });
    }
    if (acceptedFiles && acceptedFiles.length) {
      return this.setState(prev => ({
        files: [...prev.files, ...acceptedFiles],
      }));
    }
  };

  render() {
    const { error, files } = this.state;
    return (
      <div className="container">
        <h1>Cases2CSV</h1>
        {error ? (
          <p className="error">
            <strong>{error}</strong>
          </p>
        ) : null}
        <Upload onDrop={this.handleFileDrop} currentFiles={files} />
        <button
          className="btn btn-plain"
          onClick={() => this.setState({ files: [] })}
        >
          Clear
        </button>
        <button className="btn" onClick={() => this.handleSubmit()}>
          Process
        </button>
      </div>
    );
  }
}

export default App;

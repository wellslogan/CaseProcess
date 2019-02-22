import * as React from 'react';
import { render } from 'react-dom';

// add the scoped QSA shim
// (for querySelectorAll(':scope > *') support)
require('scopedQuerySelectorShim');

import App from './app';
import './style/main.css';

render(<App />, document.getElementById('app'));

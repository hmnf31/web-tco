import SfModule from './sf171-79.js';

let sf = null;
let sfReady = false;

async function initStockfish() {
  try {
    sf = await SfModule({
      locateFile: function (path) {
        return '/stockfish/' + path.split('/').pop();
      }
    });

    sf.listen = function (msg) {
      if (msg === 'uciok') {
        sfReady = true;
        self.postMessage({ type: 'ready' });
      }
      if (msg.startsWith('bestmove') || msg.startsWith('info')) {
        self.postMessage({ type: 'line', data: msg });
      }
    };

    sf.onError = function (msg) {
      self.postMessage({ type: 'error', data: msg });
    };

    sf.uci('uci');
  } catch (err) {
    self.postMessage({ type: 'error', data: err.message || 'Stockfish init failed' });
  }
}

self.onmessage = function (e) {
  var cmd = e.data;
  if (cmd === 'init') {
    initStockfish();
  } else if (sf) {
    sf.uci(cmd);
  }
};

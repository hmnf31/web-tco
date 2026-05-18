importScripts('/stockfish/stockfish-18-lite-single.js');

var engine = null;

if (typeof Stockfish === 'function') {
  engine = Stockfish();

  engine.onmessage = function (line) {
    self.postMessage(line);
  };

  engine.postMessage('uci');
  engine.postMessage('setoption name Threads value 1');
  engine.postMessage('setoption name Hash value 16');
  engine.postMessage('setoption name Use NNUE value false');
}

self.onmessage = function (e) {
  if (engine) {
    engine.postMessage(e.data);
  }
};

let ioInstance = null;

const setSocketInstance = (io) => {
  ioInstance = io;
};

const getSocketInstance = () => ioInstance;

const emitEvent = (eventName, payload) => {
  if (!ioInstance) {
    return false;
  }

  ioInstance.emit(eventName, payload);
  return true;
};

module.exports = {
  setSocketInstance,
  getSocketInstance,
  emitEvent
};

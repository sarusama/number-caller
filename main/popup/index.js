const messageElement = document.getElementById('message');
const params = new URLSearchParams(window.location.search)
const from = params.get('from');

messageElement.textContent = params.get('message');

const known = () => {
  window.postMessage('close popup');
  window.electronAPI.closePopup({
    from,
  });
};



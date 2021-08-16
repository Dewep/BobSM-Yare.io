intervalRightClick = setInterval(() => {
  if (world_initiated !== 0) {
    clearInterval(intervalRightClick)
    setTimeout(() => {
      document.getElementById('base_canvas').oncontextmenu = function (e) {
        e.preventDefault()
        user_code = `memory.board_x = ${Math.round(window.board_x)};\nmemory.board_y = ${Math.round(window.board_y)};\n${editor.getValue()}`
        socket.send(JSON.stringify({u_code: user_code, u_id: getCookie('user_id'), session_id: getCookie('session_id')}))
      }
    }, 100)
  }
}, 1000)

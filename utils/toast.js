const colors = {
  success: "linear-gradient(to right, #1db954, #88f4ae)",
  error: "linear-gradient(to right, #f44336, #e57373)",
  warn: "linear-gradient(to right, #ff9800, #ffc107)",
  info: "linear-gradient(to right, #2196f3, #03a9f4)",
};

const toast = ({
  text = "",
  type = "success",
  gravity = "top",
  position = "center"
}) => {
  Toastify({
    text,
    duration: 3000,
    close: true,
    gravity, // `top` or `bottom`
    position, // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: colors[type],
    },
    onClick: function () { }
  }).showToast();
};

export default toast;
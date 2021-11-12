// cadY 转换成 d3Y 最后一步的转换
function yTrans(y, svg_height, rect_height) {
  rect_height = rect_height ? rect_height : 0;
  return svg_height - y - rect_height;
}

// d3X 转换成 cadX
function d3XToCadX(x, base_xmin, ratio, padding_x, remove_x) {
  // return ((x - padding_x - remove_x) * ratio + base_xmin).toFixed(0) * 1;
  return ((x - padding_x) * ratio + base_xmin).toFixed(0) * 1;
}

// d3Y 转换成 cadY
function d3YToCadY(
  y,
  base_ymin,
  ratio,
  padding_y,
  remove_y,
  svg_height,
  rect_height
) {
  return (
    // ((svg_height - y - padding_y - remove_y) * ratio + base_ymin).toFixed(0) * 1
    ((svg_height - y - padding_y) * ratio + base_ymin).toFixed(0) * 1
  );
}

function getNumFixed(num, bit) {
  return Number(Number(num).toFixed(bit));
}
export { yTrans, d3XToCadX, d3YToCadY, getNumFixed };

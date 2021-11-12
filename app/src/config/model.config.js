// data
//{color, x, y, width, height, direction}
export const get_model = ({
  color = '#993030',
  x = 0,
  y = 0,
  width = 32,
  height = 32,
  direction = 'downwards', //['rightwards', 'downwards', 'leftwards', 'upwards']
} = {}) => {
  // horizontal vertical
  let _direction = ['rightwards', 'leftwards'].includes(direction)
    ? 'horizontal'
    : 'vertical';
  return {
    operator: replaceSvg(operator, {
      color,
      x,
      y,
      width,
      height,
    }),

    platform: replaceSvg(eval(`platform_${_direction}`), {
      color,
      x,
      y,
      width,
      height,
    }),

    forklift: replaceSvg(eval(`forklift_${_direction}`), {
      // color,
      color: '#FFFF00',
      x,
      y,
      width,
      height,
    }),

    AGV: replaceSvg(eval(`AGV_${_direction}`), {
      // color,
      color: '#FFFF00',
      x,
      y,
      width,
      height,
    }),

    manup_truck: replaceSvg(eval(`manup_truck_${_direction}`), {
      // color,
      color: '#FFFF00',
      x,
      y,
      width,
      height,
    }),

    convey_line: replaceSvg(eval(`convey_line_${_direction}`), {
      color,
      x,
      y,
      width,
      height,
    }),
  };
};

function replaceSvg(
  svg,
  { color = '#993030', x = 0, y = 0, width = 32, height = 32 } = {}
) {
  return (
    svg
      // .replace(new RegExp("$color","gm"), color)
      .replace(/\$color/g, color)
      .replace('$width', width)
      .replace('$height', height)
      .replace('$x', x)
      .replace('$y', y)
  );
}

let operator =
  '<svg t="1606460752318" class="operator model" originViewBox="0 0 1024 1024" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="764" width="$width" height="$height" x="$x" y="$y"><path fill="$color" d="M416.836267 91.9552a95.1296 95.1296 0 0 0 190.1568 0 95.1296 95.1296 0 0 0-190.1568 0z m174.353066 118.101333a499.575467 499.575467 0 0 1-53.9648 154.453334c-1.501867-41.2672-4.4032-49.390933-8.772266-117.930667a73.5232 73.5232 0 0 0 15.223466-36.5568H480.290133a73.489067 73.489067 0 0 0 15.223467 36.5568C491.178667 315.2896 488.106667 323.2768 486.741333 364.817067a500.565333 500.565333 0 0 1-53.930666-154.760534C392.021333 210.261333 290.133333 214.2208 290.133333 319.624533v207.735467c0 109.568 73.898667 109.568 73.898667 109.568v314.026667a72.567467 72.567467 0 0 0 21.674667 51.643733 74.683733 74.683733 0 0 0 104.6528 0 71.202133 71.202133 0 0 0 17.783466-50.449067v-304.776533h7.816534v304.8448a69.188267 69.188267 0 0 0 17.885866 50.3808 74.717867 74.717867 0 0 0 104.6528 0 72.567467 72.567467 0 0 0 21.674667-51.712v-314.026667S733.866667 636.928 733.866667 527.36V319.624533c0-105.3696-101.819733-109.397333-142.677334-109.568z" p-id="765"></path></svg>';

//preserveAspectRatio="none" 去除保持比例缩放设置
// TODO
// 旋转后坐标更新

let platform =
  '<svg t="1606461104814" class="platform model" preserveAspectRatio="none" originViewBox="0 0 2048 2048" viewBox="0 0 2048 2048" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="911" width1=32 height1=32 width="$width" height="$height" x="$x" y="$y"><g><path fill="$color" d="M0 0h2048v1024H0V0z m102.4 102.4v819.2h1843.2V102.4H102.4z" p-id="912"></path></g></svg>';

// platform_vertical
let platform_vertical =
  '<svg t="1615186694503" class="platform model" preserveAspectRatio="none" viewBox="0 0 700 1100" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="721" width="$width" height="$height" x="$x" y="$y"><g><rect x="0" y="0" width="700" height="1100" fill="none" stroke-width="50" stroke="$color"/></g></svg>';

// platform_horizontal *
let platform_horizontal =
  '<svg t="1615186694503" class="platform model" preserveAspectRatio="none" viewBox="0 0 1100 700" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="721" width="$width" height="$height" x="$x" y="$y"><g><rect x="0" y="0" width="1100" height="700" fill="none" stroke-width="50" stroke="$color"/></g></svg>';

let AGV =
  '<svg width1="350" heigh2t="300" originViewBox="0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="$width" height="$height" x="$x" y="$y"><g><path fill="transparent" d="M-1-1h352v302H-1z"/><g><path stroke-width="1.5" stroke="#000" fill="transparent" d="M42.443 71.983h274v154h-274z"/><path stroke-width="1.5" stroke="#000" fill="$color" d="M42.355 72.352h274.116v12.941H42.355z"/><path stroke-opacity="null" stroke-width="1.5" stroke="#000" fill="$color" d="M42.355 85.882h28.823v138.823H42.355z"/><path stroke-width="1.5" stroke="#000" fill="$color" d="M286.471 85.882h28.823v138.823h-28.823z"/><path stroke-width="1.5" stroke="#000" d="M57.061 57.058h27.647v14.706H57.061zM271.766 56.47h27.647v14.706h-27.647zM60.002 226.469h27.647v14.706H60.002zM274.119 226.469h27.647v14.706h-27.647z"/><path stroke-width="1.5" stroke="#000" fill="$color" d="M72.354 199.09h79.999v25.294H72.354z"/></g></g></svg>';

//AGV_vertical *
let AGV_vertical =
  '<svg t="1615186694503" class="AGV model" viewBox="0 0 420 1250" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9021" width1="42" height1="125"  width="$width" height="$height" x="$x" y="$y" fill="none" stroke-width="50" stroke="$color"><g><path d="M0 100 A100,100 0 0,1 100,0" p-id="7922" /><path d="M320 0 A100,100 0 0,1 420,100" p-id="7922" /><path d="M100 1250 A100,100 0 0,1 0,1150" p-id="7922" /><path d="M420 1150 A100,100 0 0,1 320,1250" p-id="7922" /><path d="M0 100 V1150 M420 100 V1150" p-id="7922" /><path d="M0 100 H420 M0 1150 H420 M100 1150 v-200 M320 1150 v-200" p-id="7922" stroke-width="25"/><circle cx="210" cy="625" r="100" stroke="none" fill="$color" /></g></svg>';

//AGV_horizontal
let AGV_horizontal =
  '<svg t="1615186694503" class="AGV model" viewBox="0 0 1250 420" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9021" width1="125" height1="42"  width="$width" height="$height" x="$x" y="$y" fill="none" stroke-width="50" stroke="$color"><g><path d="M100 0 A100,100 0 0,0 0,100" p-id="7922" /><path d="M0 320 A100,100 0 0,0 100,420" p-id="7922" /><path d="M1250 100 A100,100 0 0,0 1150,0" p-id="7922" /><path d="M1150 420 A100,100 0 0,0 1250,320" p-id="7922" /><path d="M100 0 H1150 M100 420 H1150" p-id="7922" /><path d="M100 0 V420 M1150 0 V420 M1150 100 h-200 M1150 320 h-200" p-id="7922" stroke-width="25"/><circle cx="625" cy="210" r="100" stroke="none" fill="$color" /></g></svg>';

let manup_truck =
  '<svg version="1" xmlns="http://www.w3.org/2000/svg" width1="582.667" height2="981.333" originViewBox="0 0 437 736" viewBox="0 0 437 736" width="$width" height="$height" x="$x" y="$y"><g><path fill="$color" d="M119 77.3c-1.3.7-3.5 2.8-4.8 4.7-2.6 3.9-2.5 8.6.3 14.1 1.3 2.5 1.5 31.2 1.2 232.6-.2 220.6-.3 230-2.1 234.3-1.5 3.8-1.7 5.9-1.1 13.5.4 4.9.9 20.5 1.1 34.5.2 15.4.8 27.6 1.5 30.8 1 4.3 1 6 0 8.5-3.2 7.9-3.3 9.2-1.8 13 1.7 4 6.8 7.7 10.5 7.7 4.8 0 9.4-3.2 11.6-7.9l2-4.6 3.9 4.2c2.1 2.3 5.8 5.2 8.2 6.3 4.3 2.1 5.3 2.1 69.9 2.1 64.6.1 65.5 0 70.3-2.1 2.6-1.1 6.5-3.4 8.5-5l3.7-3 2.1 3.5c4.9 7.9 15.3 8.6 20.4 1.3 2-2.8 2.1-10.8.1-13.4-2-2.7-1.9-9.3.2-11.7 1.6-1.6 1.8-4.4 1.9-21.5.1-10.9.5-27.1.9-36.2.8-16.4.7-16.5-1.9-22.7l-2.6-6.2V325.7c0-135.2.4-228.7.9-229.2 1.8-2 2.9-8.5 2-11.8-1.9-7.1-10.2-10.7-16.8-7.2-3.6 1.8-7 8.1-7.1 12.7V93H137.3l-.7-4.1c-.4-2.3-1.3-5.4-2.1-7-2.7-5.2-10-7.4-15.5-4.6zm186 153.9c0 69.5-.3 127.3-.6 128.5-.6 2.2-.8 2.2-18 2.1l-17.4-.1V204h-19v75.2c0 41.4-.3 77-.6 79-.4 2-1.2 3.8-1.8 4-.6.2-13.6.2-28.8 0l-27.8-.3V204h-19l-.2 78.4c-.2 43.1-.6 78.8-1.1 79.2-.4.4-8.7.7-18.5.6l-17.7-.2-.3-128.5L134 105h171v126.2z"/></g></svg>';

// manup_truck_vertical *
let manup_truck_vertical =
  '<svg t="1615186694503" class="manup_truck model" viewBox="0 0 1120 2958" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9021" width="$width" height="$height" x="$x" y="$y" fill="none" stroke-width="50" stroke="$color"><g><path d="M0 0 h1120 v2958 h-240 v-1150 M0 0 v2958 h240 v-1150" p-id="7922" ></path><path stroke-dasharray="50,150,50" stroke-width="25" d="M0 0 L1120 1808 M1120 0 L0 1808 h1120"></path></g></svg>';

// manup_truck_horizontal
let manup_truck_horizontal =
  '<svg t="1615186694503" class="manup_truck model" viewBox="0 0 2958 1120" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9021" width="$width" height="$height" x="$x" y="$y" fill="none" stroke-width="50" stroke="$color"><g><path d="M0 0 v1120 h2958 v-240 h-1150 M0 0 h2958 v240 h-1150" p-id="7922" ></path><path stroke-dasharray="50,150,50" stroke-width="25" d="M0 0 L1808 1120 M0 1120 L1808 0 v1120"></path></g></svg>';

let convey_line =
  '<svg t="1606461375135" class="convey_line model" preserveAspectRatio="none" originViewBox="0 0 1024 1024" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2213" width1=32 height2=32 width="$width" height="$height" x="$x" y="$y" fill="$color"><g fill="$color" transform2="rotate(90 512,512)"><path d="M271.360024 1023.999898c-12.253865 0-22.186664-9.864532-18.773331-22.050132V32.29013C249.17336 20.104531 259.106159 10.239999 271.360024 10.239999A22.118398 22.118398 0 0 1 293.546689 32.29013v969.659636a22.118398 22.118398 0 0 1-22.186665 22.050132z" p-id="2214"></path><path d="M699.733315 10.239999m22.186664 0l0 0q22.186664 0 22.186664 22.186664l0 969.38657q0 22.186664-22.186664 22.186665l0 0q-22.186664 0-22.186664-22.186665l0-969.38657q0-22.186664 22.186664-22.186664Z" p-id="2215"></path><path d="M808.95997 146.773319m0 22.186664l0 0q0 22.186664-22.186664 22.186665l-576.853276 0q-22.186664 0-22.186664-22.186665l0 0q0-22.186664 22.186664-22.186664l576.853276 0q22.186664 0 22.186664 22.186664Z" p-id="2216"></path><path d="M808.95997 317.439968m0 22.186665l0 0q0 22.186664-22.186664 22.186664l-576.853276 0q-22.186664 0-22.186664-22.186664l0 0q0-22.186664 22.186664-22.186665l576.853276 0q22.186664 0 22.186664 22.186665Z" p-id="2217"></path><path d="M805.546637 477.866619m0 22.186664l0 0q0 22.186664-22.186664 22.186665l-576.853276 0q-22.186664 0-22.186664-22.186665l0 0q0-22.186664 22.186664-22.186664l576.853276 0q22.186664 0 22.186664 22.186664Z" p-id="2218"></path><path d="M805.546637 648.533268m0 22.186665l0 0q0 22.186664-22.186664 22.186664l-576.853276 0q-22.186664 0-22.186664-22.186664l0 0q0-22.186664 22.186664-22.186665l576.853276 0q22.186664 0 22.186664 22.186665Z" p-id="2219"></path><path d="M805.546637 802.133253m0 22.186665l0 0q0 22.186664-22.186664 22.186664l-576.853276 0q-22.186664 0-22.186664-22.186664l0 0q0-22.186664 22.186664-22.186665l576.853276 0q22.186664 0 22.186664 22.186665Z" p-id="2220"></path></g></svg>';

// convey_line_vertical
let convey_line_vertical =
  '<svg t="1615186694503" class="convey_line model" preserveAspectRatio="none" viewBox="0 0 686 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="721" width="$width" height="$height" x="$x" y="$y"><g><path d="M0 0 h686 v1024 H0" stroke="#FF7F00" stroke-width="25" p-id="722" fill="none"></path><path d="M0 0 h50 v1024 H0 z" fill="#FF7F00"/><path d="M686 0 h-50 v1024 H686 z" fill="#FF7F00"/><path d="M343 0 L343 1024" stroke="#FF7F00" stroke-dasharray="50,100,50" stroke-width="25"/></g></svg>';

// convey_line_horizontal
let convey_line_horizontal =
  '<svg t="1615186694503" class="convey_line model" preserveAspectRatio="none" viewBox="0 0 1024 686" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="721" width="$width" height="$height" x="$x" y="$y"><g><path d="M0 0 h1024 v686 H0 z" stroke="#FF7F00" stroke-width="25" p-id="722" fill="none"></path><path d="M0 0 h1024 v50 H0 z" fill="#FF7F00"/><path d="M0 686 h1024 v-50 H0 z" fill="#FF7F00"/><path d="M0 343 L1024 343" stroke="#FF7F00" stroke-dasharray="50,100,50" stroke-width="25"/></g></svg>';

// viewBox按照实际比例来 stroke-width也会算到最终的宽高内 stroke沿着线两边分布 1120
// 只有viewBox 0 0 x y，x和y相同时，旋转才可以展示出来
// forklift_vertical *
let forklift_vertical =
  '<svg t="1615186694503" class="forklift model" viewBox="0 0 1120 3260" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9021" width="$width" height="$height" x="$x" y="$y" fill="none" stroke-width="50" stroke="$color"><g><path d="M0 0 h1120 v3260 h-240 v-1150 M0 0 v3260 h240 v-1150" p-id="7922" ></path><path stroke-width="25" d="M0 0 L1120 2110 M1120 0 L0 2110 h1120"></path></g></svg>';

// forklift_horizontal
let forklift_horizontal =
  '<svg t="1615186694503" class="forklift model" viewBox="0 0 3260 1120" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9021" width="$width" height="$height" x="$x" y="$y" fill="none" stroke-width="50" stroke="$color"><g><path d="M0 0 v1120 h3260 v-240 h-1150 M0 0 h3260 v240 h-1150" p-id="7922" ></path><path stroke-width="25" d="M0 0 L2110 1120 M0 1120 L2110 0 v1120"></path></g></svg>';

// 0 0 633 930
let forklift =
  '<svg version="1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" class="forklift model" width="84.4" height="124.0" width1="$width" height1="$height" x="$x" y="$y" originViewBox="0 0 633 930"  viewBox="0 0 633 930" fill="$color"><g><path d="M384.4 36.7c-2.2.8-5 1.7-6.4 2.2-1.4.4-44.8.6-96.5.5-61.7-.2-95.1.1-97.3.7-2.2.7-3.8 2.2-5.1 4.7-1 2-4.4 8.6-7.5 14.7-3.2 6-5 10.1-4.1 9 .9-1.1 4.1-6.7 7-12.5 3-5.8 6.1-11.4 7-12.5 1.5-1.9 1.5-1.8 1 1.5-.2 1.9-.9 7.9-1.5 13.3-.6 5.5-1.5 10.7-2 11.8-.6 1-1.1 9.1-1.1 18.1 0 76.9.2 123.1.6 122.7.3-.4 1.2-72.5 1.5-130.2V74h265.8l.1 69.2c.1 38.1.4 69.4.6 69.7.3.2.5-30.8.5-69 0-55.4-.3-70.3-1.4-73.9-.7-2.5-1.9-9.8-2.6-16.2-.7-6.4-1.6-12.2-2.1-12.9-.5-.9-5.8-1.2-19.3-1.1-16.7 0-19.4-.2-26-2.2-6.7-2.1-7.7-2.2-11.2-.9zM448.1 52.5c0 .5 1.8 4.1 3.9 8 2.2 3.8 4 6.5 4 6 0-.6-1.8-4.2-4-8-2.2-3.9-3.9-6.6-3.9-6zM458.3 95c0 2.5.2 3.5.4 2.2.2-1.2.2-3.2 0-4.5-.2-1.2-.4-.2-.4 2.3zM166.2 109.5c0 1.6.2 2.2.5 1.2.2-.9.2-2.3 0-3-.3-.6-.5.1-.5 1.8z"/><path d="M238 128.2c-.1 9.5-.1 26-.1 36.7 0 10.7-.2 20.5-.5 21.8-.6 2.2-.9 2.3-13.3 2.5l-12.6.2 14.5.6c18.6.9 154.5.9 175.5 0l16-.6-14.2-.2-14.3-.2v-78H238v17.2zM166.3 125.5c0 2.7.2 3.8.4 2.2.2-1.5.2-3.7 0-5-.2-1.2-.4 0-.4 2.8z"/><path d="M420 294.8V400H208V295.5c0-91.9-.2-104.5-1.5-104.5-.8 0-7.2 5.7-14.2 12.7l-12.8 12.8-.2 6.5c-.7 20.9-1.2 219.3-.6 233l.8 16.5 47.9.3c33.4.1 48.3.6 49.3 1.3.9.8 1.3.8 1.3 0s22.9-1.1 83.2-1.1c61.3 0 83.4-.3 83.9-1.1 1.6-2.6 2-48.4 1.5-142.4-.3-54.5-.6-102.2-.6-106l.1-7.1-7.3-7.4c-4.1-4.1-9-9.3-10.9-11.5-2-2.2-4.5-4.9-5.7-5.9l-2.2-1.9v105.1z"/><path d="M310.5 266c-1.6.4-4.2 1.1-5.6 1.4-4.3.9-11.6 7.3-14.7 12.8-8.5 15.1-2.3 34.4 13.2 41.3 24 10.6 47.6-17.7 34.4-41.2-4.2-7.5-10.7-12.4-18.1-13.7-2.1-.4-4.4-.9-5-1.1-.7-.2-2.5 0-4.2.5zM162.8 315.6c-1.8 1-3.1 2.8-3.8 5.2-1.9 6.9-3.3 53.5-2.6 88.7.8 38.9 2.2 54 5.2 56.1 1 .7 2.4 1.8 3.1 2.4.7.5 1.5 1 1.8 1 .3 0 .5-34.9.5-77.5s-.3-77.5-.7-77.4c-.5.1-2 .8-3.5 1.5zM457.6 314.7c-.7.7-.9 153.3-.1 153.3 1.5 0 5.5-2.5 6-3.8 3.1-8.2 5.2-70.4 3.6-108.9-1.3-30-2.3-36.6-6.1-39.3-1.5-1.1-3-1.7-3.4-1.3zM347.3 482c0 4.1.2 5.8.4 3.7.2-2 .2-5.4 0-7.5-.2-2-.4-.3-.4 3.8zM277.3 483.5c0 3.8.2 5.3.4 3.2.2-2 .2-5.2 0-7-.2-1.7-.4-.1-.4 3.8zM278 498.5v6.5l-40.7.2c-22.5 0-39.2.3-37.3.5 6 .7 5.4 2-2.2 4.4l-7.3 2.4-.3 15.3c-.2 11.6 0 15.4 1 15.7.7.3 9.4.8 19.3 1.2 21.5 1 20.5.1 20.5 16.4 0 14.3 0 14.2-13.4 14.7l-10.5.4-2.6 3.3c-2.5 3.3-2.5 3.7-2.5 21 0 15.8.2 17.6 1.8 18.2.9.4 2 1.1 2.4 1.7.4.6.8 53.4.8 117.3V854h71l.2-117.2.3-117.3 32.4-.3c22-.1 32.8.1 33.5.8.8.8 1.1 40.9 1.1 132 0 100.7.3 131.2 1.2 132.1 1.7 1.7 66.7 1.9 68.4.2 1.2-1.2 2.1-12.8 1.2-16.2-.5-2.1-.8-2.1-35.4-2.1H346v-12l35.3.2 35.2.3-.3-116.3c-.2-88.1 0-116.7.9-117.8.6-.8 2-1.4 3-1.4 2.7 0 3.2-3.1 2.8-21.1l-.4-16-3.5-2.9c-3-2.4-4.5-2.9-11.1-3.2-11.3-.5-11.9-1.2-11.9-15.2 0-16.1-1.3-15.2 22-15.8 10.5-.3 19.2-.7 19.4-.9.5-.5.8-8.8.7-21.5l-.1-10.1-5.8-1.7c-3.2-.9-6.7-1.6-7.8-1.6-3.4 0-9.5-2.1-8.9-3 .4-.6-13-1.1-34.2-1.2l-34.8-.3.3-6.3.4-6.2H278v6.5zm22.4 49c4.1 2.2 21.1 2.1 23.4-.1 1.3-1.3 3.2-1.5 10-1.2 11.5.6 12.2 1.5 12.2 14.9 0 5.4-.5 11-1.2 12.4l-1.1 2.5H312c-28.3 0-31.9-.2-33.1-1.7-.9-1-1.5-4.8-1.7-10.7-.3-11.8.3-15.5 3.1-16.6 3.7-1.5 16.9-1.2 20.1.5zM425.8 505.7c1.2.2 3 .2 4 0 .9-.3-.1-.5-2.3-.4-2.2 0-3 .2-1.7.4z"/><path d="M277.2 861.2l-.2 4.8h-70v8.9c0 6.1.4 9.2 1.3 9.8 1.3.8 58.6 1.3 64.9.5 4.7-.6 5-2.1 4.6-17.7-.2-6.1-.5-8.9-.6-6.3z"/></g></svg>';

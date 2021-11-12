// data
//{color, x, y, width, height}
export const get_icon = ({
  color = '#993030',
  x = 0,
  y = 0,
  width = 32,
  height = 32,
} = {}) => {
  return {
    icon_confirm: replaceSvg(icon_confirm, {
      color,
      x,
      y,
      width,
      height,
    }),

    icon_delete: replaceSvg(icon_delete, {
      color,
      x,
      y,
      width,
      height,
    }),

    icon_reset: replaceSvg(icon_reset, {
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

// 加个rect 是为了当背景，方便点击，不然path点击会露空
let icon_confirm =
  '<svg t="1614148963166" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20526" x="$x" y="$y" width="$width" height="$height"><rect x="0" y="0" width="1024" height="1024" style="fill:transparent;opacity:0.5" /><path d="M607.1 76.2c-240.2-52.9-477.9 99-530.7 339.2s99 477.9 339.2 530.7c240.2 52.9 477.9-99 530.7-339.2s-99-477.8-339.2-530.7z m141.6 375.6c-88.4 77-176.8 154-265.3 231-18.5 16.1-54.7 22.7-74.5 1.2-41.6-44.7-83.1-89.4-124.7-133.9-19-20.5-25.3-47.8-4.4-68.5 25.8-25.9 55.5-21.8 74.6-1.3 41.6 44.6 91.9 98.8 91.9 98.8 74.5-64.8 148.9-129.7 223.3-194.4 73.8-59.8 127.7 24.8 79.1 67.1z" p-id="20527" data-spm-anchor-id="a313x.7781069.0.i13" class="selected" fill="#cdcdcd"></path></svg>';

let icon_delete =
  '<svg t="1614153300146" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="21527" x="$x" y="$y" width="$width" height="$height"><rect x="0" y="0" width="1024" height="1024" style="fill:transparent;opacity:0.5" /><path d="M783.530667 723.2l-60.330667 60.330667L512 572.330667 300.8 783.530667l-60.416-60.330667L451.669333 512 240.384 300.885333l60.416-60.416L512 451.669333l211.2-211.2 60.330667 60.416L572.330667 512l211.2 211.2zM512 0a512 512 0 1 0 0 1024A512 512 0 0 0 512 0z" fill="#cdcdcd" p-id="21528"></path></svg>';

let icon_reset =
  '<svg t="1614153519844" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="26576" x="$x" y="$y" width="$width" height="$height"><rect x="0" y="0" width="1024" height="1024" style="fill:transparent;opacity:0.5" /><path d="M510.520889 11.946667A498.517333 498.517333 0 0 0 11.946667 510.407111 498.574222 498.574222 0 1 0 510.520889 11.946667z m-0.853333 783.018666a269.425778 269.425778 0 0 1-252.359112-176.298666l0.455112-0.170667a34.360889 34.360889 0 0 1-3.982223-15.530667c0-19.569778 15.815111-35.384889 35.441778-35.384889 15.701333 0 28.615111 10.410667 33.166222 24.576l0.568889-0.170666a198.542222 198.542222 0 0 0 186.709334 132.152889 198.599111 198.599111 0 0 0 198.371555-198.371556A198.542222 198.542222 0 0 0 509.724444 327.395556a196.266667 196.266667 0 0 0-68.152888 12.515555l25.031111 47.900445c2.844444 3.128889 4.664889 7.395556 4.664889 12.003555 0 9.955556-9.898667 17.521778-18.033778 17.749333h-1.080889l-176.981333-7.623111a17.635556 17.635556 0 0 1-14.165334-27.192889L355.953778 233.244444a17.749333 17.749333 0 0 1 30.606222 1.365334l21.902222 41.870222c31.288889-12.8 65.422222-19.911111 101.205334-19.911111a269.539556 269.539556 0 0 1 269.255111 269.084444 269.539556 269.539556 0 0 1-269.255111 269.255111z" fill="#cdcdcd" p-id="26577"></path></svg>';

// api/test
export const api_test = () => {
  return {
    status: 1,
    msg: '',
    data: {
      plan: {
        region1: {
          bbox: [
            [500, 500],
            [49500, 60000],
          ],
          room: 1,
          top_view: [
            {
              points: [
                [500, 500],
                [1500, 500],
                [1500, 2500],
                [500, 2500],
                [500, 500],
              ],
              colors: 'apr',
            },
            {
              points: [
                [500, 500],
                [1500, 500],
                [1500, 2500],
                [500, 2500],
                [500, 500],
              ],
              colors: 'apr',
            },
          ],
          side_view: '\u6682\u4e0d\u8003\u8651',
          front_view: '\u6682\u4e0d\u8003\u8651',
          info: { quantity: 6 },
        },
      },
      stock: 10000000000,
      dxf_path: [
        {
          navigation: [
            {
              bbox: [
                [0, 0],
                [50000, 80000],
              ],
              room: 'room1',
              height: 6000,
              image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAB8CAIAAAAJh/k/AAAEgklEQVR4Ae3BsY0YRwyG0Y+BE2WKrwOH7IOhO7jYmZNLBtOHEtXAPtjF1TEGBivAgmTYXt9iF+D/niHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmHGXxQcwRP4P4xaLD2OInGbcYvFhDJHTjFssDsZJi4Mhl3J3/req4pGMWywOxkmLgyGXcveI4J9kZkSwZWZE8E1mVhWPZNxicTBOWhwMudTr6yvw9eunt7fPmckWEZnJFhGZyfciAnh/fwdq45GMWywOxkmLgyGXcveqAsYYmckWEZnJFhGZyRYRmQlEBDDndHegqngk4xaLg3HS4mDIpdy9qoAxRmayRURmskVEZrJFRGayRcSc092BquKRjFssDsZJi4Mhl3L3qgLGGJnJFhGZyRYRmckWEZnJFhFzTncHqopHMm6xOBgnLQ6GXMrdqwoYY2QmW0RkJv+kqtwdqCoeybjF4mCctDgYcil3rypgjJGZbBGRmfwgIjKTLSLmnO4OVBWPZNxicTBOWhwMudTvn35j+/zHr5nJFhGZyRYRmcn3IiIzq8rdgarikYxbLA7G33l9ff3y5Qt/Z3Ew5FLuHhFAZvIXEcFfZGZEZGZEZGZE8E1mVhWPZNxicTBOWhwMuZS7RwTw/v5eVfxr7v7y8gJkZlXxSMYtFgfjpMXBkEu5e0QAmcl/FBFAZlYVj2TcYnEwTlocDLmUu0cEP5OZfBMRQGZGBN/LzKrikYxbLA7GSYuDIZfy7evXT29vn+ecbGOMOSebuwNVBbh7VQFjDOD9/R2ojUcybrE4GCctDoZcyt2rChhjzDnZxhhzTrYxxpyTbYwx52QbY8w53R2oKh7JuMXiYJy0OBhyKXevKmCMkZlsEZGZbBGRmfwgIuac7g5UFY9k3GJxME5aHAy5lLtXFTDGmHOyjTHmnGxjjMzkZ6rK3YGq4pGMWywOxkmLgyGXcveqAsYYmckWEZnJFhGZyRYRmckWEXNOdweqikcybrE4GCctDoZcyt2rChhjzDnZxhhzTrYxxpyTzd2rim2MMed0d6CqeCTjFosPY8il3L2qfvnl97e3z3NOtjHGnJPN3YGqAty9qtjGGHNOdweqikcybrH4MIZcyt0jgp/JTL6JCCAzI4LvZWZV8UjGXRYfwJCruXtEAJnJz7h7VfEDd395eQEys6p4JEOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOksT8BamCejJIQRkYAAAAASUVORK5CYII=',
            },
            {
              bbox: [
                [50000, 0],
                [75000, 40000],
              ],
              room: 'room2',
              height: 6000,
              image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAB8CAIAAAAJh/k/AAAEiUlEQVR4Ae3BsY0dSRJF0RvCKNQotwcrhh8hrgctj7ZKK4n0oxXaEH6EF9+OXCBRBIYg2bNb0x9VQLxzDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJEPuTv/WFVxS4bIh9w9Ivg7mRkRbJkZEXyXmVXFLRkiH3p9fQW+ffvy9vY1M9kiIjPZIiIz+VFEAI/HA6iNWzJEPuTuVQWMMTKTLSIyky0iMpMtIjITiAhgzunuQFVxS4bIh9y9qoAxRmayRURmskVEZrJFRGayRcSc092BquKWDJEPuXtVAWOMzGSLiMxki4jMZIuIzGSLiDmnuwNVxS0ZIh9y96oCxhiZyRYRmcnfqSp3B6qKWzJEPuTuVQWMMTKTLSIyk59ERGayRcSc092BquKWjKssPoEhz/bnl3+zff3PvzKTLSIyky0iMpMfRURmVpW7A1XFLRmXWHwaQ57K3SMCyEz+IiL4i8yMiMyMiMyMCL7LzKriloxLLD6NIU/l7hEBPB6PquJ/5u4vLy9AZlYVt2RcYnEwTlocDHkqd48IIDP5P0UEkJlVxS0Zl1gcjJMWB0Oeyt0jgl/JTL6LCCAzI4IfZWZVcUvGJRYH46TFwZCn8u3bty9vb1/nnGxjjDknm7sDVQW4e1UBYwzg8XgAtXFLxiUWB+OkxcGQp3L3qgLGGHNOtjHGnJNtjDHnZBtjzDnZxhhzTncHqopbMi6xOBgnLQ6GPJW7VxUwxshMtojITLaIyEx+EhFzTncHqopbMi6xOBgnLQ6GPJW7VxUwxphzso0x5pxsY4zM5Feqyt2BquKWjEssDsZJi4MhT+XuVQWMMTKTLSIyky0iMpMtIjKTLSLmnO4OVBW3ZFxicTBOWhwMeSp3rypgjDHnZBtjzDnZxhhzTjZ3ryq2Mcac092BquKWjEssDsbvvL6+vr+/8zuLgyFP5e5V9ccff769fZ1zso0x5pxs7g5UFeDuVcU2xphzujtQVdyScYnFwfid19fX9/d3fmdxMOSp3D0i+JXM5LuIADIzIvhRZlYVt2RcYnEwTlocDHkqd48IIDP5FXevKn7i7i8vL0BmVhW3ZFxicTBOWhwMkdOMSywOxkmLgyFymnGJxcE4aXEwRE4zLrE4GCctDobIacYlFgfjpMXBEDnNuMTiYJy0OBgipxmXWByMkxYHQ+Q04xKLT2OInGZcYvFpDJHTjKssPoEh8k8YIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo39F71En4zvOGHTAAAAAElFTkSuQmCC',
            },
          ],
          top_view: [
            {
              points: [
                [0, 0],
                [50000, 0],
                [50000, 80000],
                [0, 80000],
                [0, 0],
              ],
              colors: 'wall',
            },
            {
              points: [
                [50000, 0],
                [75000, 0],
                [75000, 40000],
                [50000, 40000],
                [50000, 0],
              ],
              colors: 'wall',
            },
            {
              points: [
                [10000, 20000],
                [11000, 20500],
                [10000, 21000],
                [9000, 20500],
                [10000, 20000],
              ],
              colors: 'column',
            },
            {
              points: [
                [25000, 40000],
                [26000, 40500],
                [25000, 41000],
                [24000, 40500],
                [25000, 40000],
              ],
              colors: 'column',
            },
            {
              points: [
                [40000, 60000],
                [41000, 60500],
                [40000, 61000],
                [39000, 60500],
                [40000, 60000],
              ],
              colors: 'column',
            },
            {
              points: [
                [50000, 0],
                [55000, 0],
                [55000, 5000],
                [50000, 5000],
                [50000, 0],
              ],
              colors: 'office',
            },
          ],
          '//':
            'navigation\u5bf9\u5e94\u754c\u9762\u4e2d\u7528\u6237\u9009\u62e9\u54ea\u4e2a\u4ed3\u5e93\uff0c\u6839\u636e\u5bf9\u5e94\u7684bbox\u7528\u7eff\u6846\u6807\u8bc6\u5bf9\u5e94\u4ed3\u5e93\uff0c\u5e76\u4fdd\u8bc1\u663e\u793a\u51fa\u4ed3\u5e93\u53ca\u5468\u56f4\u573a\u666f\uff0c\u524d\u7aef\u8f93\u51fapng\u7f29\u7565\u56fe\u4f5c\u4e3anavigation\u56fe\u6807\u3002fixtures\u4e3a\u8f93\u51fa\u7684\u5177\u4f53\u56fe\u50cf\uff0c\u7528\u6298\u7ebf\u4ee5\u53ca\u989c\u8272\u8868\u793a\uff0c\u524d\u7aef\u53ef\u4ee5\u6839\u636e\u753b\u9762\u5927\u5c0f\u63a7\u5236\u7ebf\u7684\u5bbd\u5ea6',
        },
        {
          room1: {
            obstacles: [
              {
                polygon: [
                  [0, 0],
                  [50000, 0],
                  [50000, 80000],
                  [0, 80000],
                ],
                type: 'wall',
              },
              {
                points: [
                  [10000, 20000],
                  [11000, 20500],
                  [10000, 21000],
                  [9000, 20500],
                ],
                type: 'column',
              },
              {
                points: [
                  [25000, 40000],
                  [26000, 40500],
                  [25000, 41000],
                  [24000, 40500],
                ],
                type: 'column',
              },
              {
                points: [
                  [40000, 60000],
                  [41000, 60500],
                  [40000, 61000],
                  [39000, 60500],
                ],
                type: 'column',
              },
            ],
            info: '\u6682\u65e0',
          },
          room2: {
            obstacles: [
              {
                polygon: [
                  [50000, 0],
                  [75000, 0],
                  [75000, 40000],
                  [50000, 40000],
                ],
                type: 'wall',
              },
              {
                polygon: [
                  [50000, 0],
                  [55000, 0],
                  [55000, 5000],
                  [50000, 5000],
                ],
                type: 'office',
              },
            ],
            info: '\u6682\u65e0',
          },
        },
      ],
      dwg_path: [
        {
          navigation: [
            {
              bbox: [
                [0, 0],
                [50000, 80000],
              ],
              room: 'room1',
              height: 6000,
              image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAB8CAIAAAAJh/k/AAAEgklEQVR4Ae3BsY0YRwyG0Y+BE2WKrwOH7IOhO7jYmZNLBtOHEtXAPtjF1TEGBivAgmTYXt9iF+D/niHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmCHSmHGXxQcwRP4P4xaLD2OInGbcYvFhDJHTjFssDsZJi4Mhl3J3/req4pGMWywOxkmLgyGXcveI4J9kZkSwZWZE8E1mVhWPZNxicTBOWhwMudTr6yvw9eunt7fPmckWEZnJFhGZyfciAnh/fwdq45GMWywOxkmLgyGXcveqAsYYmckWEZnJFhGZyRYRmQlEBDDndHegqngk4xaLg3HS4mDIpdy9qoAxRmayRURmskVEZrJFRGayRcSc092BquKRjFssDsZJi4Mhl3L3qgLGGJnJFhGZyRYRmckWEZnJFhFzTncHqopHMm6xOBgnLQ6GXMrdqwoYY2QmW0RkJv+kqtwdqCoeybjF4mCctDgYcil3rypgjJGZbBGRmfwgIjKTLSLmnO4OVBWPZNxicTBOWhwMudTvn35j+/zHr5nJFhGZyRYRmcn3IiIzq8rdgarikYxbLA7G33l9ff3y5Qt/Z3Ew5FLuHhFAZvIXEcFfZGZEZGZEZGZE8E1mVhWPZNxicTBOWhwMuZS7RwTw/v5eVfxr7v7y8gJkZlXxSMYtFgfjpMXBkEu5e0QAmcl/FBFAZlYVj2TcYnEwTlocDLmUu0cEP5OZfBMRQGZGBN/LzKrikYxbLA7GSYuDIZfy7evXT29vn+ecbGOMOSebuwNVBbh7VQFjDOD9/R2ojUcybrE4GCctDoZcyt2rChhjzDnZxhhzTrYxxpyTbYwx52QbY8w53R2oKh7JuMXiYJy0OBhyKXevKmCMkZlsEZGZbBGRmfwgIuac7g5UFY9k3GJxME5aHAy5lLtXFTDGmHOyjTHmnGxjjMzkZ6rK3YGq4pGMWywOxkmLgyGXcveqAsYYmckWEZnJFhGZyRYRmckWEXNOdweqikcybrE4GCctDoZcyt2rChhjzDnZxhhzTrYxxpyTzd2rim2MMed0d6CqeCTjFosPY8il3L2qfvnl97e3z3NOtjHGnJPN3YGqAty9qtjGGHNOdweqikcybrH4MIZcyt0jgp/JTL6JCCAzI4LvZWZV8UjGXRYfwJCruXtEAJnJz7h7VfEDd395eQEys6p4JEOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOkMUOksT8BamCejJIQRkYAAAAASUVORK5CYII=',
            },
            {
              bbox: [
                [50000, 0],
                [75000, 40000],
              ],
              room: 'room2',
              height: 6000,
              image:
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAB8CAIAAAAJh/k/AAAEiUlEQVR4Ae3BsY0dSRJF0RvCKNQotwcrhh8hrgctj7ZKK4n0oxXaEH6EF9+OXCBRBIYg2bNb0x9VQLxzDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJHGDJEPuTv/WFVxS4bIh9w9Ivg7mRkRbJkZEXyXmVXFLRkiH3p9fQW+ffvy9vY1M9kiIjPZIiIz+VFEAI/HA6iNWzJEPuTuVQWMMTKTLSIyky0iMpMtIjITiAhgzunuQFVxS4bIh9y9qoAxRmayRURmskVEZrJFRGayRcSc092BquKWDJEPuXtVAWOMzGSLiMxki4jMZIuIzGSLiDmnuwNVxS0ZIh9y96oCxhiZyRYRmcnfqSp3B6qKWzJEPuTuVQWMMTKTLSIyk59ERGayRcSc092BquKWjKssPoEhz/bnl3+zff3PvzKTLSIyky0iMpMfRURmVpW7A1XFLRmXWHwaQ57K3SMCyEz+IiL4i8yMiMyMiMyMCL7LzKriloxLLD6NIU/l7hEBPB6PquJ/5u4vLy9AZlYVt2RcYnEwTlocDHkqd48IIDP5P0UEkJlVxS0Zl1gcjJMWB0Oeyt0jgl/JTL6LCCAzI4IfZWZVcUvGJRYH46TFwZCn8u3bty9vb1/nnGxjjDknm7sDVQW4e1UBYwzg8XgAtXFLxiUWB+OkxcGQp3L3qgLGGHNOtjHGnJNtjDHnZBtjzDnZxhhzTncHqopbMi6xOBgnLQ6GPJW7VxUwxshMtojITLaIyEx+EhFzTncHqopbMi6xOBgnLQ6GPJW7VxUwxphzso0x5pxsY4zM5Feqyt2BquKWjEssDsZJi4MhT+XuVQWMMTKTLSIyky0iMpMtIjKTLSLmnO4OVBW3ZFxicTBOWhwMeSp3rypgjDHnZBtjzDnZxhhzTjZ3ryq2Mcac092BquKWjEssDsbvvL6+vr+/8zuLgyFP5e5V9ccff769fZ1zso0x5pxs7g5UFeDuVcU2xphzujtQVdyScYnFwfid19fX9/d3fmdxMOSp3D0i+JXM5LuIADIzIvhRZlYVt2RcYnEwTlocDHkqd48IIDP5FXevKn7i7i8vL0BmVhW3ZFxicTBOWhwMkdOMSywOxkmLgyFymnGJxcE4aXEwRE4zLrE4GCctDobIacYlFgfjpMXBEDnNuMTiYJy0OBgipxmXWByMkxYHQ+Q04xKLT2OInGZcYvFpDJHTjKssPoEh8k8YIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo0ZIo39F71En4zvOGHTAAAAAElFTkSuQmCC',
            },
          ],
          top_view: [
            {
              points: [
                [0, 0],
                [50000, 0],
                [50000, 80000],
                [0, 80000],
                [0, 0],
              ],
              colors: 'wall',
            },
            {
              points: [
                [50000, 0],
                [75000, 0],
                [75000, 40000],
                [50000, 40000],
                [50000, 0],
              ],
              colors: 'wall',
            },
            {
              points: [
                [10000, 20000],
                [11000, 20500],
                [10000, 21000],
                [9000, 20500],
                [10000, 20000],
              ],
              colors: 'column',
            },
            {
              points: [
                [25000, 40000],
                [26000, 40500],
                [25000, 41000],
                [24000, 40500],
                [25000, 40000],
              ],
              colors: 'column',
            },
            {
              points: [
                [40000, 60000],
                [41000, 60500],
                [40000, 61000],
                [39000, 60500],
                [40000, 60000],
              ],
              colors: 'column',
            },
            {
              points: [
                [50000, 0],
                [55000, 0],
                [55000, 5000],
                [50000, 5000],
                [50000, 0],
              ],
              colors: 'office',
            },
          ],
          '//':
            'navigation\u5bf9\u5e94\u754c\u9762\u4e2d\u7528\u6237\u9009\u62e9\u54ea\u4e2a\u4ed3\u5e93\uff0c\u6839\u636e\u5bf9\u5e94\u7684bbox\u7528\u7eff\u6846\u6807\u8bc6\u5bf9\u5e94\u4ed3\u5e93\uff0c\u5e76\u4fdd\u8bc1\u663e\u793a\u51fa\u4ed3\u5e93\u53ca\u5468\u56f4\u573a\u666f\uff0c\u524d\u7aef\u8f93\u51fapng\u7f29\u7565\u56fe\u4f5c\u4e3anavigation\u56fe\u6807\u3002fixtures\u4e3a\u8f93\u51fa\u7684\u5177\u4f53\u56fe\u50cf\uff0c\u7528\u6298\u7ebf\u4ee5\u53ca\u989c\u8272\u8868\u793a\uff0c\u524d\u7aef\u53ef\u4ee5\u6839\u636e\u753b\u9762\u5927\u5c0f\u63a7\u5236\u7ebf\u7684\u5bbd\u5ea6',
        },
        {
          room1: {
            obstacles: [
              {
                polygon: [
                  [0, 0],
                  [50000, 0],
                  [50000, 80000],
                  [0, 80000],
                ],
                type: 'wall',
              },
              {
                points: [
                  [10000, 20000],
                  [11000, 20500],
                  [10000, 21000],
                  [9000, 20500],
                ],
                type: 'column',
              },
              {
                points: [
                  [25000, 40000],
                  [26000, 40500],
                  [25000, 41000],
                  [24000, 40500],
                ],
                type: 'column',
              },
              {
                points: [
                  [40000, 60000],
                  [41000, 60500],
                  [40000, 61000],
                  [39000, 60500],
                ],
                type: 'column',
              },
            ],
            info: '\u6682\u65e0',
          },
          room2: {
            obstacles: [
              {
                polygon: [
                  [50000, 0],
                  [75000, 0],
                  [75000, 40000],
                  [50000, 40000],
                ],
                type: 'wall',
              },
              {
                polygon: [
                  [50000, 0],
                  [55000, 0],
                  [55000, 5000],
                  [50000, 5000],
                ],
                type: 'office',
              },
            ],
            info: '\u6682\u65e0',
          },
        },
      ],
    },
  };
};

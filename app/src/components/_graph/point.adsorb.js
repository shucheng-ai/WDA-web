import {
  toDecimal,
  get_node_points,
  regionToPolygon,
} from '../v2/project.utils';

import store from '../../models/store/index';

const GRAPH_OPERATIONS_LIST = store.getters.graph_operations_list;

// 输入一个点
// 如果有吸附结果则返回吸附到的点
// 如果没有吸附结果，则返回null
class PointAdsorb {
  // constructor
  constructor({ vue = null, SPACE = 5 } = {}) {
    this.vue = vue;
    this.SPACE = SPACE;
    this.segments = []; // 可吸附线段列表
    this.points = []; // 可吸附顶点列表
  }

  start() {
    this.segments = this.createLineSegment();
    // console.log('this.segments: ', this.segments);
  }

  check(x, y, flag = false) {
    let result = [x, y];
    // 吸附到线段
    // let nearestLineResult = this.getPintNearestLine(x, y, this.segments);
    // console.log('nearestLineResult: ', nearestLineResult);
    // if (nearestLineResult[0] <= this.SPACE) {
    //   // 距离小于吸附距离
    //   let segment = nearestLineResult[1];
    //   let nearestPoint = this.getNearestPoint(
    //     segment[0][0],
    //     segment[0][1],
    //     segment[1][0],
    //     segment[1][1],
    //     x,
    //     y
    //   );
    //   console.log('nearestPoint: ', nearestPoint);

    //   if (nearestPoint) {
    //     console.log('#####nearestPoint: ', nearestPoint);
    //     result = nearestPoint;
    //   }
    // }

    let nearestLineResult = this.getPintNearestLineAndPoint(
      x,
      y,
      this.segments
    );
    // if (flag) {
    //   console.log('nearestLineResult: ', nearestLineResult);
    // }

    if (nearestLineResult[0] <= this.SPACE) {
      // 距离小于吸附距离
      let nearestPoint = nearestLineResult[2];

      if (nearestPoint) {
        result = nearestPoint;
      }
    }

    return result;
  }

  // 创造线段
  createLineSegment() {
    let that = this.vue;
    let result = [];
    // 创建线段

    //top_view里的点，每组内部，每个点连接加上起点和终点组成点线段
    that.top_views.forEach((tvs) => {
      result = this.pointsToSegment(tvs.draw_points, result);
    });

    // 画图图形组成的线段
    GRAPH_OPERATIONS_LIST.forEach((graph) => {
      let type = graph.id;
      if (!Array.isArray(that[`${type}s`])) {
        return;
      }
      that[`${type}s`].forEach((item) => {
        // 也有4个点的矩形存在，需要格式化点的顺序
        if (item.points.length === 2) {
          // 矩形
          let arr = regionToPolygon(item.points);
          result = this.pointsToSegment(arr, result);
        } else {
          // 多边形
          result = this.pointsToSegment(item.points, result);
        }
        if (item.draw_points) {
          result = this.pointsToSegment(item.draw_points, result);
        }
      });
    });

    // models元素组成的线段
    store.state.animation.fixtures.forEach((fixture) => {
      let fixture_points = get_node_points(fixture.id);
      let arr = regionToPolygon(fixture_points);
      result = this.pointsToSegment(arr, result);
    });

    return result;
  }

  // 构成线段
  // arr: [[10, 20], [30, 40]]
  pointsToSegment(arr, result) {
    let len = arr.length;
    for (let i = 0; i < len - 1; i++) {
      let p1 = arr[i];
      let p2 = arr[i + 1];
      // 跳过两个端点相同点线段
      if (
        toDecimal(p1[0]) === toDecimal(p2[0]) &&
        toDecimal(p1[1]) === toDecimal(p2[1])
      ) {
        continue;
      }
      result.push([p1, p2]);
    }
    // 加上起点和终点组成点线段
    result.push([arr[len - 1], arr[0]]);
    return result;
  }

  // 计算离某个点最近的线段
  getPintNearestLine(x, y, lineSegments) {
    let minNum = Infinity; // 最短距离
    let minLine; // 最短距离的那条线段

    for (let i = 0; i < lineSegments.length; i++) {
      let item = lineSegments[i];
      let a = item[0];
      let b = item[1];
      // 业务情况不能求点到直线的距离，而是点到线段的距离
      let d = this.getLinePointDistance(a[0], a[1], b[0], b[1], x, y);
      if (d < minNum) {
        minNum = d;
        minLine = item;
      }
    }
    return [minNum, minLine];
  }

  // 计算离某个点最近的线段和线段上的点
  getPintNearestLineAndPoint(x, y, lineSegments) {
    let minNum = Infinity; // 最短距离
    let minLine; // 最短距离的那条线段
    let minPoint = [];

    for (let i = 0; i < lineSegments.length; i++) {
      let item = lineSegments[i];
      let a = item[0];
      let b = item[1];
      // 业务情况不能求点到直线的距离，而是点到线段的距离

      // let result = this.pointToLineDistance(x, y, a[0], a[1], b[0], b[1]);
      // let d = result[0];

      // if (d < minNum) {
      //   minNum = d;
      //   minLine = item;
      //   minPoint = [toDecimal(result[1].x), toDecimal(result[1].y)];
      // }

      let d = this.getPointToSegmentDistance(x, y, a[0], a[1], b[0], b[1]);

      if (d < minNum) {
        minNum = d;
        minLine = item;
      }
    }
    let a = minLine[0];
    let b = minLine[1];
    minPoint = this.getPointToSegmentNearestPoint(x, y, a[0], a[1], b[0], b[1]);
    return [minNum, minLine, minPoint];
  }

  // 获取点到直线的距离
  getLinePointDistance(x1, y1, x2, y2, x, y) {
    // 直线垂直于x轴
    if (x1 === x2) {
      return toDecimal(Math.abs(x - x1));
    } else {
      let B = -1;
      let A, C;
      A = (y2 - y1) / (x2 - x1);
      C = 0 - B * y1 - A * x1;
      return toDecimal(
        Math.abs((A * x + B * y + C) / Math.sqrt(A * A + B * B))
      );
    }
  }

  // 获取线段上离某个点最近的点
  getNearestPoint(x1, y1, x2, y2, x0, y0) {
    let x, y;
    // TODO x1 和 x2相同的情况
    if (x1 === x2) {
      x = x0 - x1;
      y = y0;
    } else {
      let k = (y2 - y1) / (x2 - x1);
      x = (k * k * x1 + k * (y0 - y1) + x0) / (k * k + 1);
      y = k * (x - x1) + y1;
    }
    // 判断该点的x坐标是否在线段的两个端点内
    let min = Math.min(x1, x2);
    let max = Math.max(x1, x2);
    // 如果在线段内就是我们要的点
    if (x >= min && x <= max) {
      return [x, y];
    } else {
      // console.log('超 [x, y]: ', [x, y]);
      // 否则返回最近的端点 TODO
      return Math.abs(x - x1) >= Math.abs(x - x2) ? [x2, y2] : [x1, y1];
    }
  }

  // 求点与线段的最短距离，并返回该最短距离在线段上的坐标。
  // xx yy 点坐标
  // x1 y1 x2 y2 线段上的两个点
  pointToLineDistance(xx, yy, x1, y1, x2, y2) {
    let ang1, ang2, ang, m;
    let result = 0;
    // 分别计算三条边的长度
    const a = Math.sqrt((x1 - xx) * (x1 - xx) + (y1 - yy) * (y1 - yy));
    if (a === 0) {
      return [
        0,
        {
          x: x1,
          y: y1,
        },
      ];
    }
    const b = Math.sqrt((x2 - xx) * (x2 - xx) + (y2 - yy) * (y2 - yy));
    if (b === 0) {
      return [
        0,
        {
          x: x2,
          y: y2,
        },
      ];
    }
    const c = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    // 如果线段是一个点则退出函数并返回距离
    if (c === 0) {
      result = a;
      return [
        result,
        {
          x: x1,
          y: y1,
        },
      ];
    }
    // 如果点(xx,yy到点x1,y1)这条边短
    if (a < b) {
      // 如果直线段AB是水平线。得到直线段AB的弧度
      if (y1 === y2) {
        if (x1 < x2) {
          ang1 = 0;
        } else {
          ang1 = Math.PI;
        }
      } else {
        m = (x2 - x1) / c;
        if (m - 1 > 0.00001) {
          m = 1;
        }
        ang1 = Math.acos(m);
        if (y1 > y2) {
          ang1 = Math.PI * 2 - ang1;
        } // 直线(x1,y1)-(x2,y2)与折X轴正向夹角的弧度
      }
      m = (xx - x1) / a;
      if (m - 1 > 0.00001) {
        m = 1;
      }
      ang2 = Math.acos(m);
      if (y1 > yy) {
        ang2 = Math.PI * 2 - ang2;
      } // 直线(x1,y1)-(xx,yy)与折X轴正向夹角的弧度
      ang = ang2 - ang1;
      if (ang < 0) {
        ang = -ang;
      }
      if (ang > Math.PI) {
        ang = Math.PI * 2 - ang;
      }
      // 如果是钝角则直接返回距离
      if (ang > Math.PI / 2) {
        return [
          a,
          {
            x: x1,
            y: y1,
          },
        ];
      }
      // 返回距离并且求得当前距离所在线段的坐标
      if (x1 === x2) {
        return [
          b * Math.sin(ang),
          {
            x: x1,
            y: yy,
          },
        ];
      } else if (y1 === y2) {
        return [
          b * Math.sin(ang),
          {
            x: xx,
            y: y1,
          },
        ];
      }
      // 直线的斜率存在且不为0的情况下
      let x = 0,
        y = 0;
      const k1 = (y2 - y1) / x2 - x1;
      const kk = -1 / k1;
      const bb = yy - xx * kk;
      const b1 = y2 - x2 * k1;
      x = (b1 - bb) / (kk - k1);
      y = kk * x + bb;
      return [
        a * Math.sin(ang),
        {
          x,
          y,
        },
      ];
    }
    // 如果两个点的纵坐标相同，则直接得到直线斜率的弧度
    if (y1 === y2) {
      if (x1 < x2) {
        ang1 = Math.PI;
      } else {
        ang1 = 0;
      }
    } else {
      m = (x1 - x2) / c;
      if (m - 1 > 0.00001) {
        m = 1;
      }
      ang1 = Math.acos(m);
      if (y2 > y1) {
        ang1 = Math.PI * 2 - ang1;
      }
    }
    m = (xx - x2) / b;
    if (m - 1 > 0.00001) {
      m = 1;
    }
    ang2 = Math.acos(m); // 直线(x2-x1)-(xx,yy)斜率的弧度
    if (y2 > yy) {
      ang2 = Math.PI * 2 - ang2;
    }
    ang = ang2 - ang1;
    if (ang < 0) {
      ang = -ang;
    }
    if (ang > Math.PI) {
      ang = Math.PI * 2 - ang;
    } // 交角的大小
    // 如果是对角则直接返回距离
    if (ang > Math.PI / 2) {
      return [
        b,
        {
          x: x2,
          y: y2,
        },
      ];
    }
    // 如果是锐角，返回计算得到的距离,并计算出相应的坐标
    if (x1 === x2) {
      return [
        b * Math.sin(ang),
        {
          x: x1,
          y: yy,
        },
      ];
    } else if (y1 === y2) {
      return [
        b * Math.sin(ang),
        {
          x: xx,
          y: y1,
        },
      ];
    }
    // 直线的斜率存在且不为0的情况下
    let x = 0,
      y = 0;
    const k1 = (y2 - y1) / x2 - x1;
    const kk = -1 / k1;
    const bb = yy - xx * kk;
    const b1 = y2 - x2 * k1;
    x = (b1 - bb) / (kk - k1);
    y = kk * x + bb;
    return [
      b * Math.sin(ang),
      {
        x,
        y,
      },
    ];
  }

  // 原理 https://www.cnblogs.com/flyinggod/p/9359534.html
  getPointToSegmentDistance(x, y, x1, y1, x2, y2) {
    let cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
    if (cross <= 0) {
      return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
    }

    let d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (cross >= d2) {
      return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
    }

    let r = cross / d2;
    let px = x1 + (x2 - x1) * r;
    let py = y1 + (y2 - y1) * r;
    return Math.sqrt((x - px) * (x - px) + (py - y) * (py - y));
  }

  // 原理 https://zhuanlan.zhihu.com/p/26307123
  // 原理 https://www.cnblogs.com/Ritchie/p/5498041.html
  // 获取线段上离某个点最近的点
  getPointToSegmentNearestPoint(x, y, x1, y1, x2, y2) {
    // 三种情况
    // 分别两个端点
    // 点到直线的垂线与线段的交点

    let cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
    if (cross <= 0) {
      return [x1, y1];
    }

    let d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (cross >= d2) {
      return [x2, y2];
    }

    // 联立 Ax + By + C = 0;
    let A = y2 - y1;
    let B = x1 - x2;
    let C = x2 * y1 - x1 * y2;
    let _x =
      (Math.pow(B, 2) * x - A * B * y - A * C) /
      (Math.pow(A, 2) + Math.pow(B, 2));
    let _y =
      (Math.pow(A, 2) * y - A * B * x - B * C) /
      (Math.pow(A, 2) + Math.pow(B, 2));
    return [_x, _y];
  }
}

export default PointAdsorb;

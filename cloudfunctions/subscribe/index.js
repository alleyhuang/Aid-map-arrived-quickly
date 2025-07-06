// 云函数入口文件
const cloud = require("wx-server-sdk");
const request = require("request");
const axios = require("axios");

cloud.init({
  env: "cloudbase-0gl4nb7m872c6379",
});

const db = cloud.database();

const getAccessToken = () => {
  const res = request({
    method: "get",
    url: "https://api.weixin.qq.com/cgi-bin/token",
    qs: {
      grant_type: "client_credential",
      appid: "wx5cf87678079c02a6",
      secret: "d2bfe18629354620c89215166d755fa4",
    },
  });

  return res;
};

/**
 * 计算两个经纬度点之间的距离（Haversine 公式）
 * @param {number} lat1 - 第一个点的纬度
 * @param {number} lon1 - 第一个点的经度
 * @param {number} lat2 - 第二个点的纬度
 * @param {number} lon2 - 第二个点的经度
 * @param {string} [unit='km'] - 单位：'km'（千米）、'm'（米）、'mi'（英里）、'nmi'（海里）
 * @returns {number} 两点之间的距离
 */
function calculateDistance(lat1, lon1, lat2, lon2, unit = "m") {
  // 地球半径（千米）
  const R = 6371;

  // 将角度转换为弧度
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  // 计算经纬度差值（弧度）
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // 应用 Haversine 公式
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // 计算距离（千米）
  let distance = R * c;

  // 根据指定单位转换结果
  switch (unit) {
    case "m": // 米
      return distance * 1000;
    case "mi": // 英里
      return distance * 0.621371;
    case "nmi": // 海里
      return distance * 0.539957;
    default: // 千米（默认）
      return distance;
  }
}

// 获取openid
const getAllUserOpenId = async (helpData) => {
  // 获取用户 openid
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  // 获取所有用户信息
  const res = await db.collection("users").get();
  const AllUser = res.data;
  // return AllUser;
  // let distance;
  // let rangetag;
  const users =
    AllUser.map((item) => {
      const { location, range } = item;
      // rangetag = range;
      const { latitude, longitude } = location;
      let distance = calculateDistance(
        latitude,
        longitude,
        helpData.location.latitude,
        helpData.location.longitude
      );
      if (distance / 1000 <= range) {
        distance = distance.toFixed(2);
        return (
          {
            ...item,
            distance,
          } || {}
        );
      }
      // return {
      //   ...item,
      //   distance,
      // };
    }).filter((item) => item?.userid !== openid) || [];
  // .filter((item) => item?.userid === openid) || [];
  return {
    users,
    AllUser,
    openid,
  };

  // {
  //   userids,
  //   openid,
  //   distance,
  //   rangetag,
  //   AllUser,
  // }
};

const sendMsg = async (helpData) => {
  const { users } = await getAllUserOpenId(helpData);

  // 云托管服务的内网地址（需在云托管控制台查看）
  await axios.post(
    "https://demo-171600-8-1366724238.sh.run.tcloudbase.com/send",
    {
      users,
      helpData,
    }
  );
  return users;
};

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case "testSub":
      return await testSub();
    case "getAccessToken":
      return await getAccessToken();
    case "sendMsg":
      return await sendMsg(event.helpData);
    case "getAllUserOpenId":
      return await getAllUserOpenId(event.helpData);
  }
};

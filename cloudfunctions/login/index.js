// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: "cloudbase-0gl4nb7m872c6379",
});

const db = cloud.database();

// 查询数据
const selectRecord = async () => {
  // 返回数据库查询结果
  return await db.collection("help_requests").get();
};

// 获取注册信息
const getRegisterInfo = async () => {
  const { openid } = await getOpenId();
  return await db.collection("users").where({ userid: openid }).get();
};

// 获取openid
const getOpenId = async () => {
  // 获取基础信息
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

// 验证用户是否注册
const checkRegister = async () => {
  const { openid } = await getOpenId();
  const result = await db.collection("users").where({ userid: openid }).get();
  return result;
};

// 创建集合
const createCollection = async () => {
  try {
    // 创建集合
    await db.createCollection("sales");
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华东",
        city: "上海",
        sales: 11,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华东",
        city: "南京",
        sales: 11,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华南",
        city: "广州",
        sales: 22,
      },
    });
    await db.collection("sales").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        region: "华南",
        city: "深圳",
        sales: 22,
      },
    });
    return {
      success: true,
    };
  } catch (e) {
    // 这里catch到的是该collection已经存在，从业务逻辑上来说是运行成功的，所以catch返回success给前端，避免工具在前端抛出异常
    return {
      success: true,
      data: "create collection success",
    };
  }
};

// 新增数据
const insertRecord = async (event) => {
  try {
    const { openid } = await getOpenId();
    const insertRecord = event.data;
    const database = event.database;
    const insertData =
      database === "users"
        ? {
            // 注册用户数据字段
            data: {
              _id: insertRecord.openid,
              userid: openid,
              name: insertRecord.name,
              phone: insertRecord.phone,
              location: insertRecord.location,
              helpType: insertRecord.helpType,
              helpDetail: insertRecord.helpDetail,
              certificates: insertRecord.certificates,
              isProfessional: insertRecord.regType,
              status: insertRecord.status,
              range: insertRecord.range,
              registerTime: insertRecord.registerTime,
              lastActiveTime: insertRecord.lastActiveTime,
            },
          }
        : {
            // 请求求助事件数据字段
            data: {
              _id: insertRecord.openid,
              eventId: insertRecord.eventId,
              selectedTypes: insertRecord.selectedTypes,
              urgency: insertRecord.urgency,
              phone: insertRecord.phone,
              contactName: insertRecord.contactName,
              contactRelation: insertRecord.contactRelation,
              helpTypes: insertRecord.helpTypes,
              otherType: insertRecord.otherType,
              desc: insertRecord.desc,
              resolve: insertRecord.resolve,
              images: insertRecord.images,
              location: insertRecord.location,
              status: insertRecord.status,
              createTime: insertRecord.createTime,
              updateTime: insertRecord.updateTime,
            },
          };
    // 插入数据
    await db.collection(database).add(insertData);
    return {
      success: true,
      data: event.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 更新数据
const updateRecord = async (event) => {
  try {
    // 遍历修改数据库信息
    await db
      .collection("help_requests")
      .where({
        eventId: event.data.eventId,
      })
      .update({
        data: {
          resolve: event.data.resolve,
        },
      });
    return {
      success: true,
      data: event.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e,
    };
  }
};

// 查询帮助历史数据
const getHelpHistory = async () => {
  // 返回数据库查询结果
  return await db.collection("help_history").get();
};

// 查询 eventId 等于用户 openid 的数据
const getEventByOpenId = async () => {
  const { openid } = await getOpenId();
  return await db
    .collection("help_requests")
    .where({
      eventId: db.RegExp({
        regexp: openid,
        options: "i", // 忽略大小写
      }),
    })
    .get();
};

// 首页地图展示正在进行中的事件
const getActiveEvents = async () => {
  return await db
    .collection("help_requests")
    .where({
      resolve: false,
    })
    .get();
};

const getEventByEventId = async (eventId) => {
  return await db
    .collection("help_requests")
    .where({
      eventId,
    })
    .get();
};

// 获取发布者正在进行的事件
const getActiveEventsByUser = async () => {
  const { openid } = await getOpenId();
  return await db
    .collection("help_requests")
    .where({
      eventId: db.RegExp({
        regexp: openid,
        options: "i", // 忽略大小写
      }),
      resolve: false,
    })
    .get();
};

const getDetailByll = async (event) => {
  const { latitude, longitude } = event.data;
  return await db
    .collection("help_requests")
    .where({
      "location.latitude": latitude,
      "location.longitude": longitude,
    })
    .get();
};

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case "getEventByEventId":
      return await getEventByEventId(event.eventId);
    case "checkRegister":
      return await checkRegister();
    case "getRegisterInfo":
      return await getRegisterInfo();
    case "getDetailByll":
      return await getDetailByll(event);
    case "getActiveEvents":
      return await getActiveEvents();
    case "getOpenId":
      return await getOpenId();
    case "createCollection":
      return await createCollection();
    case "selectRecord":
      return await selectRecord();
    case "updateRecord":
      return await updateRecord(event);
    case "insertRecord":
      return await insertRecord(event);
    case "deleteRecord":
      return await deleteRecord(event);
    case "getHelpHistory":
      return await getHelpHistory();
    case "getEventByOpenId":
      return await getEventByOpenId();
    case "getActiveEventsByUser":
      return await getActiveEventsByUser();
  }
};

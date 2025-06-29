// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({
  env: "cloud1-0gqaia6j7d5e2f00",
});

const db = cloud.database();

// 查询数据
const selectRecord = async () => {
  // 返回数据库查询结果
  return await db.collection("help_requests").get();
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
    const insertRecord = event.data;
    const database = event.database;
    const insertData =
      database === "users"
        ? {
          // 注册用户数据字段
            data: {
              _id: insertRecord.openid,
              name: insertRecord.name,
              phone: insertRecord.phone,
              location: insertRecord.location,
              helpRange: insertRecord.range,
              helpType: insertRecord.helpType,
              helpDetail: insertRecord.helpDetail,
              certificates: insertRecord.certificates,
              isProfessional: insertRecord.regType,
              status: insertRecord.status,
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
      eventId: openid,
    })
    .get();
};

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
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
  }
};

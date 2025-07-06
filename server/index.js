const express = require("express");
const request = require("request");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// // 加载时区插件
dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
app.use(express.json());

app.post("/send", async function (req, res) {
  const { users, helpData } = req.body; // 通过get参数形式指定openid
  console.log("openidList", users, helpData);

  // 在这里直接是触发性发送，也可以自己跟业务做绑定，改成事件性发送
  const info = await sendapi(users, helpData);
  res.send(info);
});

app.listen(80, function () {
  console.log("服务启动成功！");
});

async function sendapi(users, helpData) {
  return new Promise((resolve, reject) => {
    users.forEach(async (user) => {
      if (user) {
        request(
          {
            url: "http://api.weixin.qq.com/cgi-bin/message/subscribe/send",
            method: "POST",
            body: JSON.stringify({
              touser: user.userid,
              template_id: "eFLGRhgHwN39bY_h_s0OzPrYK2WnUeKB2kA6YwgBkhA",
              miniprogram_state: "developer",
              page: `pages/help-detail/index?eventId=${helpData.eventId}`,
              data: {
                // 这里替换成自己的模板ID的详细事项，不要擅自添加或更改
                // 按照key前面的类型，对照参数限制填写，否则都会发送不成功
                //
                phone_number2: {
                  value: helpData.phone,
                },
                thing3: {
                  value: helpData.location.address,
                },
                time5: {
                  value: dayjs
                    .utc(helpData.createTime)
                    .tz("Asia/Shanghai")
                    .format("YYYY年M月D H:mm"),
                },
                thing6: {
                  value: `${user.distance.tofixed(2)}米`,
                },
                thing8: {
                  value: helpData.desc,
                },
              },
            }),
          },
          function (error, res) {
            if (error) {
              reject(error);
              console.log("error", error);
            }
            resolve(res.body);
          }
        );
      }
    });
  });
}

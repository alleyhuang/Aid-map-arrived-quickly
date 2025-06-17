const app = getApp()

Page({
  data: {
    // 表单数据
    formData: {
      urgency: '', // 紧急程度：normal, urgent, emergency
      phone: '', // 联系电话
      contactName: '', // 紧急联系人姓名
      contactRelation: '', // 紧急联系人关系
      helpTypes: [], // 帮助类型
      otherType: '', // 其他类型
      desc: '', // 情况描述
      images: [], // 图片列表
      location: null // 位置信息
    },
    // 表单状态
    formStatus: {
      phoneValid: false,
      canSubmit: false
    },
    // 紧急程度选项
    urgencyLevels: [
      { label: '普通', value: 'normal', color: '#00C37D' },
      { label: '紧急', value: 'urgent', color: '#FF9500' },
      { label: '特急', value: 'emergency', color: '#e60012' }
    ],
    // 帮助类型选项
    helpTypes: [
      '医疗急救类',
      '消防救援类',
      '工程技术类',
      '灾害应对类',
      '心理援助类',
      '交通运输类',
      '物资供给类',
      '其他'
    ],
    selectedTypes: [],
    showOther: false, // 是否显示其他类型输入框
    showPreview: false, // 是否显示预览弹窗
    submitting: false, // 是否正在提交
    previewData: {}, // 预览数据
    isLongPress: false,
    longPressTimer: null,
    longPressDuration: 500,
    isSubmitting: false,
    statusBarHeight: 0,
    statusBarHeightRpx: 0
  },

  onLoad() {
    const res = wx.getSystemInfoSync();
    const statusBarHeight = res.statusBarHeight; // px
    const windowWidth = res.windowWidth; // px
    // 1px = 750rpx / windowWidth
    const statusBarHeightRpx = statusBarHeight * 750 / windowWidth;
    this.setData({
      statusBarHeight,
      statusBarHeightRpx
    });
    // 初始化数据
    this.setData({
      selectedTypes: [],
      'formData.helpTypes': [],
      showOther: false
    });

    console.log('页面加载，初始状态：', {
      helpTypes: this.data.helpTypes,
      selectedTypes: this.data.selectedTypes
    });

    // 防御app.globalData为undefined
    const openid = app.globalData && app.globalData.openid;
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }, 2000)
        }
      })
    }
  },

  // 紧急程度选择
  onUrgencyChange(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      'formData.urgency': value
    }, () => {
      if (wx.vibrateShort) {
        wx.vibrateShort();
      }
    });
    this.validateForm();
  },

  // 输入框内容变化
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });

    // 特殊字段验证
    if (field === 'phone') {
      this.validatePhone(value);
    }
    
    this.validateForm();
  },

  // 帮助类型选择
  onSelectType(e) {
    console.log('点击事件触发：', {
      rawIndex: e.currentTarget.dataset.index,
      convertedIndex: Number(e.currentTarget.dataset.index),
      currentSelectedTypes: this.data.selectedTypes
    });

    const index = Number(e.currentTarget.dataset.index);
    
    // 确保selectedTypes是一个数组
    let selectedTypes = Array.isArray(this.data.selectedTypes) ? [...this.data.selectedTypes] : [];
    
    // 检查是否已经选中
    const typeIndex = selectedTypes.indexOf(index);
    
    if (typeIndex > -1) {
      // 如果已经选中，则取消选中
      selectedTypes.splice(typeIndex, 1);
    } else {
      // 如果未选中，则添加到选中列表
      selectedTypes.push(index);
    }
    
    // 检查是否选择了"其他"
    const showOther = selectedTypes.includes(this.data.helpTypes.length - 1);
    
    console.log('准备更新状态：', {
      newSelectedTypes: selectedTypes,
      showOther: showOther
    });
    
    // 更新状态
    this.setData({
      selectedTypes: selectedTypes,
      showOther: showOther,
      'formData.helpTypes': selectedTypes.map(i => this.data.helpTypes[i])
    }, () => {
      console.log('状态更新后：', {
        newSelectedTypes: this.data.selectedTypes,
        newHelpTypes: this.data.formData.helpTypes,
        showOther: this.data.showOther
      });
      
      if (wx.vibrateShort) {
        wx.vibrateShort();
      }
    });
    
    this.validateForm();
  },

  // 选择帮助类型
  selectHelpType(e) {
    if (!e || !e.currentTarget || !e.currentTarget.dataset) {
      return;
    }
    
    const index = e.currentTarget.dataset.index;
    if (typeof index === 'undefined') {
      return;
    }

    const selectedTypes = this.data.selectedTypes || [];
    const typeIndex = selectedTypes.indexOf(index);
    
    if (typeIndex === -1) {
      selectedTypes.push(index);
    } else {
      selectedTypes.splice(typeIndex, 1);
    }
    
    this.setData({
      selectedTypes: selectedTypes
    });
  },

  // 选择图片
  async onChooseImage() {
    try {
      if (wx.vibrateShort) {
        wx.vibrateShort();
      }
      const res = await wx.chooseImage({
        count: 3 - this.data.formData.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      // 上传图片到云存储
      const uploadTasks = res.tempFilePaths.map(path => this.uploadImage(path));
      const uploadResults = await Promise.all(uploadTasks);
      
      this.setData({
        'formData.images': [...this.data.formData.images, ...uploadResults]
      });
    } catch (error) {
      console.error('选择图片失败：', error);
    }
  },

  // 上传图片到云存储
  async uploadImage(tempFilePath) {
    try {
      const cloudPath = `help/${app.globalData.openid}/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`
      const res = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      })
      return res.fileID
    } catch (error) {
      console.error('上传图片失败：', error)
      wx.showToast({
        title: '上传图片失败',
        icon: 'none'
      })
      throw error
    }
  },

  // 删除图片
  onDeleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.formData.images];
    images.splice(index, 1);
    this.setData({
      'formData.images': images
    }, () => {
      if (wx.vibrateShort) {
        wx.vibrateShort();
      }
    });
  },

  // 预览图片
  onPreviewImage(e) {
    const url = e.currentTarget.dataset.url;
    if (wx.vibrateShort) {
      wx.vibrateShort();
    }
    wx.previewImage({
      current: url,
      urls: this.data.formData.images
    });
  },

  // 请求位置授权
  onRequestLocationAuth() {
    if (wx.vibrateShort) {
      wx.vibrateShort();
    }
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        this.getLocation();
      },
      fail: () => {
        wx.showModal({
          title: '提示',
          content: '需要获取您的位置信息，是否前往设置？',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
      }
    });
  },

  // 获取位置信息
  async getLocation() {
    try {
      const res = await wx.getLocation({
        type: 'gcj02'
      })
      
      // 获取地址信息
      const location = await wx.cloud.callFunction({
        name: 'getLocation',
        data: {
          latitude: res.latitude,
          longitude: res.longitude
        }
      })

      this.setData({
        'formData.location': {
          latitude: res.latitude,
          longitude: res.longitude,
          address: location.result.address
        }
      })

      wx.showToast({
        title: '已获取位置',
        icon: 'success'
      })

      this.validateForm()
    } catch (error) {
      console.error('获取位置失败：', error)
      wx.showToast({
        title: '获取位置失败',
        icon: 'none'
      })
    }
  },

  // 验证手机号
  validatePhone(phone) {
    const phoneValid = /^1[3-9]\d{9}$/.test(phone)
    this.setData({
      'formStatus.phoneValid': phoneValid
    })
    return phoneValid
  },

  // 验证表单
  validateForm() {
    const { formData } = this.data
    const { phoneValid } = this.data.formStatus

    // 基础验证
    const baseValid = formData.urgency && 
                     phoneValid && 
                     formData.helpTypes.length > 0 &&
                     formData.location

    // 特急情况额外验证
    const emergencyValid = formData.urgency !== 'emergency' || 
                          (formData.contactName && formData.contactRelation)

    // 其他类型验证
    const otherTypeValid = !this.data.showOther || formData.otherType

    const canSubmit = baseValid && emergencyValid && otherTypeValid

    this.setData({
      'formStatus.canSubmit': canSubmit
    })
  },

  // 显示预览
  showHelpPreview() {
    if (!this.data.formStatus.canSubmit) {
      wx.showToast({
        title: '请完善必填信息',
        icon: 'none'
      });
      return;
    }

    if (wx.vibrateShort) {
      wx.vibrateShort();
    }

    // 准备预览数据
    const urgencyLevel = this.data.urgencyLevels.find(
      level => level.value === this.data.formData.urgency
    );

    this.setData({
      showPreview: true,
      previewData: {
        urgencyLabel: urgencyLevel.label,
        urgencyColor: urgencyLevel.color
      }
    });
  },

  // 取消预览
  onCancelPreview() {
    if (wx.vibrateShort) {
      wx.vibrateShort();
    }
    this.setData({
      showPreview: false
    });
  },

  // 提交表单
  async onSubmit() {
    if (this.data.submitting) return;

    if (wx.vibrateShort) {
      wx.vibrateShort();
    }

    this.setData({ submitting: true });

    try {
      const db = app.globalData.db;
      const helpData = {
        ...this.data.formData,
        _openid: app.globalData.openid,
        status: 'pending',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      };

      await db.collection('help_requests').add({
        data: helpData
      });

      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    } catch (error) {
      console.error('发布失败：', error);
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'error'
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
}) 
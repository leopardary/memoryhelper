const data = {
  "统编版小学语文一年级 - 下册": {
    type: 'module',
    description: '统编版小学语文一年级 - 下册',
    imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/yuwen_1b.jpeg`],
    order: 2,
    data: [{
      "第一单元": {
        type: 'chapter',
        description: '第一单元：识字',
        imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/lesson1a.jpeg`],
        order: 1,
        data: [{
          "春夏秋冬": {
            type: 'lesson',
            description: '第一课，春夏秋冬',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/lesson1a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/lesson1b.jpeg`],
            order: 1,
            data: [
  {
    "霜": {
      "labels": ["会认字"],
      "组词": ["霜冻", "霜降", "冰霜"],
      "造句": [
        "深秋的早晨，草地上铺满银白的霜冻。",
        "二十四节气中的'霜降'表示天气渐冷。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/霜.gif`]
    }
  },
  {
    "吹": {
      "labels": ["会认字"],
      "组词": ["吹风", "吹拂", "吹奏"],
      "造句": [
        "春风轻轻吹拂着柳枝。",
        "他正在学习吹奏萨克斯管。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/吹.gif`]
    }
  },
  {
    "落": {
      "labels": ["会认字"],
      "组词": ["落叶", "降落", "日落"],
      "造句": [
        "秋天的落叶像蝴蝶一样飞舞。",
        "飞机平稳地降落在跑道上。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/落.gif`]
    }
  },
  {
    "降": {
      "labels": ["会认字"],
      "组词": ["降落", "降温", "降雨"],
      "造句": [
        "气象台预报明天将大幅降温。",
        "久旱逢甘霖，这场降雨解了旱情。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/降.gif`]
    }
  },
  {
    "飘": {
      "labels": ["会认字"],
      "组词": ["飘雪", "飘带", "飘扬"],
      "造句": [
        "窗外开始飘雪，大地渐渐变白。",
        "五星红旗在风中高高飘扬。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/飘.gif`]
    }
  },
  {
    "游": {
      "labels": ["会认字"],
      "组词": ["游泳", "游玩", "旅游"],
      "造句": [
        "夏天我们经常去河边游泳。",
        "假期全家去海南旅游很开心。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/游.gif`]
    }
  },
  {
    "池": {
      "labels": ["会认字"],
      "组词": ["池塘", "水池", "电池"],
      "造句": [
        "小鸭子在池塘里欢快地游来游去。",
        "遥控器需要两节五号电池。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/池.gif`]
    }
  },
  {
    "春": {
      "labels": ["会写字"],
      "组词": ["春天", "春节", "春风"],
      "造句": [
        "春天来了，小草从土里探出头来。",
        "我们全家欢欢喜喜过春节。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/春.gif`]
    }
  },
  {
    "风": {
      "labels": ["会写字"],
      "组词": ["大风", "风筝", "风景"],
      "造句": [
        "今天刮大风，树叶哗哗作响。",
        "周末我们去公园放风筝。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/风.gif`]
    }
  },
  {
    "花": {
      "labels": ["会写字"],
      "组词": ["花朵", "花园", "花生"],
      "造句": [
        "五颜六色的花朵在微风中摇曳。",
        "奶奶在院子里种了很多花生。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/花.gif`]
    }
  },
  {
    "入": {
      "labels": ["会写字"],
      "组词": ["入口", "进入", "收入"],
      "造句": [
        "博物馆的入口处需要安检。",
        "爸爸的工作收入很稳定。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/入.gif`]
    }
  },
  {
    "冬": {
      "labels": ["会写字"],
      "组词": ["冬天", "冬至", "冬瓜"],
      "造句": [
        "冬天我们要穿厚厚的棉衣。",
        "冬至这天北方人习惯吃饺子。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/冬.gif`]
    }
  },
  {
    "雪": {
      "labels": ["会写字"],
      "组词": ["雪花", "雪人", "滑雪"],
      "造句": [
        "晶莹的雪花从天空飘落下来。",
        "寒假我们一起去滑雪场玩。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/雪.gif`]
    }
  },
  {
    "飞": {
      "labels": ["会写字"],
      "组词": ["飞机", "飞翔", "飞鸟"],
      "造句": [
        "天空中有一架喷气式飞机飞过。",
        "小鸟在蓝天自由自在地飞翔。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson1/飞.gif`]
    }
  }
]
          },
          "姓氏歌": {
            type: 'lesson',
            description: '第二课，姓氏歌',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/lesson2a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/lesson2b.jpeg`],
            order: 2,
            data: [
  {
    "氏": {
      "labels": ["会认字"],
      "组词": ["姓氏", "神农氏", "摄氏度"],
      "造句": [
        "中国人的姓氏大多源自祖先的封地或职业。",
        "今天气温高达38摄氏度。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/氏.gif`]
    }
  },
  {
    "李": {
      "labels": ["会认字"],
      "组词": ["李子", "李树", "李白"],
      "造句": [
        "奶奶家的李子树结满了果实。",
        "李白是唐代著名的浪漫主义诗人。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/李.gif`]
    }
  },
  {
    "张": {
      "labels": ["会认字"],
      "组词": ["张开", "紧张", "纸张"],
      "造句": [
        "小鸟张开翅膀飞向蓝天。",
        "考试前不要太紧张，放松心态。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/张.gif`]
    }
  },
  {
    "古": {
      "labels": ["会认字"],
      "组词": ["古代", "古老", "古诗"],
      "造句": [
        "我们学习了很多有趣的古代故事。",
        "这首古诗描写了美丽的江南风光。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/古.gif`]
    }
  },
  {
    "吴": {
      "labels": ["会认字"],
      "组词": ["吴语", "吴国", "吴姓"],
      "造句": [
        "吴语是江浙地区的方言。",
        "三国时期的吴国位于长江流域。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/吴.gif`]
    }
  },
  {
    "赵": {
      "labels": ["会认字"],
      "组词": ["赵姓", "赵国", "赵州桥"],
      "造句": [
        "赵钱孙李是《百家姓》的开头。",
        "赵州桥是我国古代著名的石拱桥。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/赵.gif`]
    }
  },
  {
    "钱": {
      "labels": ["会认字"],
      "组词": ["钱包", "金钱", "钱币"],
      "造句": [
        "妈妈送我一个可爱的卡通钱包。",
        "博物馆里陈列着古代的各种钱币。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/钱.gif`]
    }
  },
  {
    "孙": {
      "labels": ["会认字"],
      "组词": ["孙子", "孙女", "孙悟空"],
      "造句": [
        "爷爷奶奶特别疼爱小孙子。",
        "孙悟空是《西游记》里的主要角色。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/孙.gif`]
    }
  },
  {
    "周": {
      "labels": ["会认字"],
      "组词": ["周围", "周末", "圆周"],
      "造句": [
        "我们仔细观察了校园周围的环境。",
        "周末爸爸妈妈带我去公园玩。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/周.gif`]
    }
  },
  {
    "官": {
      "labels": ["会认字"],
      "组词": ["官员", "五官", "官职"],
      "造句": [
        "我们要保护好自己的五官。",
        "古代科举考试是选拔官员的重要方式。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/官.gif`]
    }
  },
  {
    "姓": {
      "labels": ["会写字"],
      "组词": ["姓名", "姓氏", "老百姓"],
      "造句": [
        "请在这里填写你的姓名和班级。",
        "政府要多为老百姓办实事。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/姓.gif`]
    }
  },
  {
    "么": {
      "labels": ["会写字"],
      "组词": ["什么", "怎么", "那么"],
      "造句": [
        "你在书包里找什么呢？",
        "这道题应该怎么做呢？"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/么.gif`]
    }
  },
  {
    "国": {
      "labels": ["会写字"],
      "组词": ["国家", "国旗", "祖国"],
      "造句": [
        "每周一我们都要举行升国旗仪式。",
        "我们要热爱自己的祖国。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/国.gif`]
    }
  },
  {
    "方": {
      "labels": ["会写字"],
      "组词": ["方向", "方法", "正方形"],
      "造句": [
        "迷路时要先辨明方向。",
        "这个盒子是正方形的。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/方.gif`]
    }
  },
  {
    "什": {
      "labels": ["会写字"],
      "组词": ["什么", "什锦", "为什么"],
      "造句": [
        "你最喜欢吃什么水果？",
        "这道什锦炒饭里有五种食材。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/什.gif`]
    }
  },
  {
    "双": {
      "labels": ["会写字"],
      "组词": ["双手", "双休", "双胞胎"],
      "造句": [
        "我们要用双手创造美好生活。",
        "这对双胞胎长得真像啊！"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/双.gif`]
    }
  },
  {
    "王": {
      "labels": ["会写字"],
      "组词": ["王子", "王国", "姓王"],
      "造句": [
        "童话故事里常有王子和公主。",
        "我的同桌姓王，叫王小明。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson2/王.gif`]
    }
  }
]
          },
          "小青蛙": {
            type: 'lesson',
            description: '第三课，小青蛙',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/lesson3a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/lesson3b.jpeg`],
            order: 3,
            data: [
  {
    "眼": {
      "labels": ["会认字"],
      "组词": ["眼睛", "眼镜", "眼泪"],
      "造句": [
        "我们要好好保护自己的眼睛。",
        "看书时光线不足要戴眼镜。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/眼.gif`]
    }
  },
  {
    "睛": {
      "labels": ["会认字"],
      "组词": ["眼睛", "定睛", "画龙点睛"],
      "造句": [
        "小猫的眼睛在夜里会发光。",
        "最后这句真是画龙点睛之笔。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/睛.gif`]
    }
  },
  {
    "保": {
      "labels": ["会认字"],
      "组词": ["保护", "保存", "保险"],
      "造句": [
        "警察叔叔保护大家的安全。",
        "电脑文件要及时保存。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/保.gif`]
    }
  },
  {
    "护": {
      "labels": ["会认字"],
      "组词": ["护士", "爱护", "护送"],
      "造句": [
        "白衣天使护士照顾病人很辛苦。",
        "我们要爱护公共财物。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/护.gif`]
    }
  },
  {
    "害": {
      "labels": ["会认字"],
      "组词": ["害怕", "伤害", "害虫"],
      "造句": [
        "第一次上台演讲有点害怕。",
        "农民伯伯在田里捉害虫。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/害.gif`]
    }
  },
  {
    "事": {
      "labels": ["会认字"],
      "组词": ["事情", "故事", "好事"],
      "造句": [
        "自己的事情要自己做。",
        "老师讲了一个有趣的故事。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/事.gif`]
    }
  },
  {
    "让": {
      "labels": ["会认字"],
      "组词": ["让座", "礼让", "转让"],
      "造句": [
        "公交车上要给老人让座。",
        "同学之间要懂得礼让。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/让.gif`]
    }
  },
  {
    "病": {
      "labels": ["会认字"],
      "组词": ["生病", "病房", "疾病"],
      "造句": [
        "天气变化大容易生病。",
        "医院病房要保持安静。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/病.gif`]
    }
  },
  {
    "青": {
      "labels": ["会写字"],
      "组词": ["青草", "青春", "青山"],
      "造句": [
        "春天田野里长满青草。",
        "我们要珍惜青春时光。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/青.gif`]
    }
  },
  {
    "气": {
      "labels": ["会写字"],
      "组词": ["天气", "气球", "生气"],
      "造句": [
        "今天天气晴朗适合郊游。",
        "不要乱发脾气会伤身体。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/气.gif`]
    }
  },
  {
    "情": {
      "labels": ["会写字"],
      "组词": ["心情", "事情", "友情"],
      "造句": [
        "帮助别人后心情很愉快。",
        "同学之间要珍惜友情。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/情.gif`]
    }
  },
  {
    "生": {
      "labels": ["会写字"],
      "组词": ["生日", "生活", "学生"],
      "造句": [
        "今天我过生日真开心。",
        "我们要学会独立生活。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/生.gif`]
    }
  },
  {
    "清": {
      "labels": ["会写字"],
      "组词": ["清水", "清晨", "清洁"],
      "造句": [
        "小河里的清水哗哗流淌。",
        "清晨的空气特别新鲜。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/清.gif`]
    }
  },
  {
    "晴": {
      "labels": ["会写字"],
      "组词": ["晴天", "晴朗", "放晴"],
      "造句": [
        "晴天适合晾晒衣物。",
        "雨过天晴出现彩虹。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/晴.gif`]
    }
  },
  {
    "请": {
      "labels": ["会写字"],
      "组词": ["请坐", "邀请", "请假"],
      "造句": [
        "客人来了要说\"请坐\"。",
        "生病了要向老师请假。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/请.gif`]
    }
  }
]
          },
          "猜字谜": {
            type: 'lesson',
            description: '第四课，猜字谜',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/lesson4a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/lesson4b.jpeg`],
            order: 4,
            data: [
  {
    "相": {
      "labels": ["会认字"],
      "组词": ["相互", "相信", "相见"],
      "造句": [
        "同学之间应该相互帮助。",
        "开学第一天，我们高兴地相见。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/相.gif`]
    }
  },
  {
    "遇": {
      "labels": ["会认字"],
      "组词": ["遇见", "遇到", "机遇"],
      "造句": [
        "上学路上遇见了班主任老师。",
        "遇到困难要想办法解决。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/遇.gif`]
    }
  },
  {
    "喜": {
      "labels": ["会认字"],
      "组词": ["喜欢", "喜悦", "喜鹊"],
      "造句": [
        "我很喜欢读童话故事。",
        "喜鹊在枝头喳喳叫，带来喜讯。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/喜.gif`]
    }
  },
  {
    "欢": {
      "labels": ["会认字"],
      "组词": ["欢乐", "欢迎", "欢快"],
      "造句": [
        "儿童节这天校园充满欢乐。",
        "我们热烈欢迎新同学。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/欢.gif`]
    }
  },
  {
    "怕": {
      "labels": ["会认字"],
      "组词": ["害怕", "不怕", "怕生"],
      "造句": [
        "第一次上台有点害怕。",
        "勇敢的孩子不怕打针。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/怕.gif`]
    }
  },
  {
    "言": {
      "labels": ["会认字"],
      "组词": ["语言", "发言", "名言"],
      "造句": [
        "我们要学会礼貌的语言。",
        "这句名言激励我努力学习。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/言.gif`]
    }
  },
  {
    "互": {
      "labels": ["会认字"],
      "组词": ["互相", "互助", "互联网"],
      "造句": [
        "同学们要互相尊重。",
        "互联网让世界变得更小。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/互.gif`]
    }
  },
  {
    "令": {
      "labels": ["会认字"],
      "组词": ["命令", "口令", "令人"],
      "造句": [
        "体育老师喊出口令。",
        "这个好消息令人高兴。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/令.gif`]
    }
  },
  {
    "纯": {
      "labels": ["会认字"],
      "组词": ["纯洁", "纯净", "单纯"],
      "造句": [
        "孩子们的心灵很纯洁。",
        "我们要喝纯净的水。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/纯.gif`]
    }
  },
  {
    "净": {
      "labels": ["会认字"],
      "组词": ["干净", "净化", "洁净"],
      "造句": [
        "教室要保持干净整洁。",
        "绿植能净化空气。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/净.gif`]
    }
  },
  {
    "字": {
      "labels": ["会写字"],
      "组词": ["写字", "汉字", "字典"],
      "造句": [
        "我每天练习写字。",
        "遇到不认识的字要查字典。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/字.gif`]
    }
  },
  {
    "右": {
      "labels": ["会写字"],
      "组词": ["右边", "左右", "右转"],
      "造句": [
        "我的铅笔盒放在右边。",
        "路口要右转才能到学校。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/右.gif`]
    }
  },
  {
    "时": {
      "labels": ["会写字"],
      "组词": ["时间", "小时", "按时"],
      "造句": [
        "我们要珍惜时间。",
        "每天按时睡觉很重要。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/时.gif`]
    }
  },
  {
    "万": {
      "labels": ["会写字"],
      "组词": ["万一", "千万", "万里"],
      "造句": [
        "过马路千万要小心。",
        "长城蜿蜒万里。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/万.gif`]
    }
  },
  {
    "左": {
      "labels": ["会写字"],
      "组词": ["左边", "左右", "左手"],
      "造句": [
        "我的书包放在左边。",
        "用左手写字的人很少。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/左.gif`]
    }
  },
  {
    "红": {
      "labels": ["会写字"],
      "组词": ["红色", "红旗", "红花"],
      "造句": [
        "我最喜欢红色的书包。",
        "校园里红旗迎风飘扬。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/红.gif`]
    }
  },
  {
    "动": {
      "labels": ["会写字"],
      "组词": ["运动", "动物", "动作"],
      "造句": [
        "每天运动身体好。",
        "动物园里有很多可爱的动物。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/动.gif`]
    }
  }
]
          },
          "练习": {
            type: 'lesson',
            description: '练习',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practicea.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practiceb.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practicec.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practiced.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practicee.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practicef.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practiceg.jpeg`],
            order: 5,
            data: [
  {
    "阴": {
      "labels": ["会认字"],
      "组词": ["阴天", "树阴", "阴凉"],
      "造句": [
        "今天是个阴天，可能要下雨。",
        "夏天我喜欢在树阴下乘凉。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/阴.gif`]
    }
  },
  {
    "雷": {
      "labels": ["会认字"],
      "组词": ["打雷", "雷声", "地雷"],
      "造句": [
        "打雷的时候不要站在大树下。",
        "远处传来轰隆隆的雷声。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/雷.gif`]
    }
  },
  {
    "电": {
      "labels": ["会认字"],
      "组词": ["闪电", "电话", "电视"],
      "造句": [
        "夜空中划过一道明亮的闪电。",
        "我给奶奶打电话问好。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/电.gif`]
    }
  },
  {
    "阵": {
      "labels": ["会认字"],
      "组词": ["阵雨", "阵地", "一阵"],
      "造句": [
        "夏天的阵雨来得快去得也快。",
        "一阵风吹落了树上的叶子。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/阵.gif`]
    }
  },
  {
    "冰": {
      "labels": ["会认字"],
      "组词": ["冰块", "冰雹", "滑冰"],
      "造句": [
        "饮料里加冰块更凉爽。",
        "冬天我们在湖面上滑冰。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/冰.gif`]
    }
  },
  {
    "冻": {
      "labels": ["会认字"],
      "组词": ["冰冻", "冻伤", "解冻"],
      "造句": [
        "冬天小河会结冰冻住。",
        "肉要解冻后才能烹饪。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/冻.gif`]
    }
  },
  {
    "夹": {
      "labels": ["会认字"],
      "组词": ["夹子", "夹心", "文件夹"],
      "造句": [
        "我用夹子把试卷夹在一起。",
        "这块夹心饼干很好吃。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/夹.gif`]
    }
  },
  {
    "见": {
      "labels": ["会写字"],
      "组词": ["看见", "见面", "再见"],
      "造句": [
        "我看见一只小鸟飞过窗口。",
        "放学时我们要说'再见'。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/见.gif`]
    }
  },
  {
    "长": {
      "labels": ["会写字"],
      "组词": ["长大", "长江", "长短"],
      "造句": [
        "我希望快点长大当科学家。",
        "长江是我国最长的河流。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/长.gif`]
    }
  },
  {
    "白": {
      "labels": ["会写字"],
      "组词": ["白色", "白云", "明白"],
      "造句": [
        "天上的白云像棉花糖。",
        "老师讲解后我明白了。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/白.gif`]
    }
  },
  {
    "回": {
      "labels": ["会写字"],
      "组词": ["回家", "回答", "来回"],
      "造句": [
        "放学后我直接回家。",
        "请举手回答老师的问题。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/回.gif`]
    }
  },
  {
    "国": {
      "labels": ["会写字"],
      "组词": ["国家", "国旗", "祖国"],
      "造句": [
        "每周一我们升国旗唱国歌。",
        "我们要热爱自己的祖国。"
      ],
                  "imageUrls": [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/国.gif`]
    }
  }
]
          },
        }]
      }
    }
    ]
  }
}

export default data;

// lesson1: 会认字：霜，吹，落，降，飘，游，池 会写字：春，风，花，入，冬，雪，飞
// lesson2: 会认字：氏，李，张，古，吴，赵，钱，孙，周，官 会写字：姓，么，国，方，什，双，王
// lesson3: 会认字：眼，睛，保，护，害，事，让，病 会写字：青，气，情，生，清，晴，请
// lesson4: 会认字：相，遇，喜，欢，怕，言，互，令，纯，净 会写字：字，右，时，万，左，红，动
// practice：会认字：阴，雷，电，阵，冰，冻，夹 会写字：见，长，白，回，国
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
            data: []
          },
          "小青蛙": {
            type: 'lesson',
            description: '第三课，小青蛙',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/lesson3a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson3/lesson3b.jpeg`],
            order: 3,
            data: []
          },
          "猜字谜": {
            type: 'lesson',
            description: '第四课，猜字谜',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/lesson4a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/lesson4/lesson4b.jpeg`],
            order: 4,
            data: []
          },
          "练习": {
            type: 'lesson',
            description: '练习',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practicea.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practiceb.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practicec.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practiced.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practicee.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practicef.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit1/practice/practiceg.jpeg`],
            order: 5,
            data: []
          },
        }]
      }
    }
    ]
  }
}

export default data;

// lesson1: 会认字：霜，吹，落，降，飘，游，池 会写字：春，风，花，入，冬，雪，飞
//
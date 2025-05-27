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
            data: []
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
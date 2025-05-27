const data = {
  "统编版小学语文一年级 - 下册": {
    type: 'module',
    description: '统编版小学语文一年级 - 下册',
    imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/yuwen_1b.jpeg`],
    order: 2,
    data: [{
      "第二单元": {
        type: 'chapter',
        description: '第二单元：课文',
        imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson1/lesson1a.jpeg`],
        order: 2,
        data: [{
          "吃水不忘挖井人": {
            type: 'lesson',
            description: '第一课，吃水不忘挖井人',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson1/lesson1a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson1/lesson1b.jpeg`],
            order: 1,
            data: []
          },
          "我多想去看看": {
            type: 'lesson',
            description: '第二课，我多想去看看',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson2/lesson2a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson2/lesson2b.jpeg`],
            order: 2,
            data: []
          },
          "一个接一个": {
            type: 'lesson',
            description: '第三课，一个接一个',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson3/lesson3a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson3/lesson3b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson3/lesson3c.jpeg`],
            order: 3,
            data: []
          },
          "四个太阳": {
            type: 'lesson',
            description: '第四课，四个太阳',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson4/lesson4a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/lesson4/lesson4b.jpeg`],
            order: 4,
            data: []
          },
          "练习": {
            type: 'lesson',
            description: '练习',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/practice/practicea.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/practice/practiceb.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit2/practice/practicec.jpeg`],
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
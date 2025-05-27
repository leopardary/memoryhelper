const data = {
  "统编版小学语文一年级 - 下册": {
    type: 'module',
    description: '统编版小学语文一年级 - 下册',
    imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/yuwen_1b.jpeg`],
    order: 2,
    data: [{
      "第三单元": {
        type: 'chapter',
        description: '第三单元：课文',
        imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson5/lesson5a.jpeg`],
        order: 3,
        data: [{
          "小公鸡和小鸭子": {
            type: 'lesson',
            description: '第五课，小公鸡和小鸭子',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson5/lesson5a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson5/lesson5b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson5/lesson5c.jpeg`],
            order: 1,
            data: []
          },
          "树和喜鹊": {
            type: 'lesson',
            description: '第六课，树和喜鹊',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson6/lesson6a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson6/lesson6b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson6/lesson6c.jpeg`],
            order: 2,
            data: []
          },
          "怎么都快乐": {
            type: 'lesson',
            description: '第七课，怎么都快乐',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson7/lesson7a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson7/lesson7b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/lesson7/lesson7c.jpeg`],
            order: 3,
            data: []
          },
          "练习": {
            type: 'lesson',
            description: '练习',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/practice/practicea.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/practice/practiceb.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/practice/practicec.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/practice/practiced.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit3/practice/practicee.jpeg`],
            order: 4,
            data: []
          },
        }]
      }
    }
    ]
  }
}

export default data;
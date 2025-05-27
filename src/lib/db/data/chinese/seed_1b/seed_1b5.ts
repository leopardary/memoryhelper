const data = {
  "统编版小学语文一年级 - 下册": {
    type: 'module',
    description: '统编版小学语文一年级 - 下册',
    imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/yuwen_1b.jpeg`],
    order: 2,
    data: [{
      "第五单元": {
        type: 'chapter',
        description: '第五单元：识字',
        imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/lesson5/lesson5a.jpeg`],
        order: 5,
        data: [{
          "动物儿歌": {
            type: 'lesson',
            description: '第五课，动物儿歌',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/lesson5/lesson5a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/lesson5/lesson5b.jpeg`],
            order: 1,
            data: []
          },
          "古对今": {
            type: 'lesson',
            description: '第六课，古对今',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/lesson6/lesson6a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/lesson6/lesson6b.jpeg`],
            order: 2,
            data: []
          },
          "操场上": {
            type: 'lesson',
            description: '第七课，操场上',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/lesson7/lesson7a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/lesson7/lesson7b.jpeg`],
            order: 3,
            data: []
          },
          "人之初": {
            type: 'lesson',
            description: '第八课，人之初',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/lesson8/lesson8a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/lesson8/lesson8b.jpeg`],
            order: 4,
            data: []
          },
          "练习": {
            type: 'lesson',
            description: '练习',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/practice/practicea.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/practice/practiceb.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/practice/practicec.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/practice/practiced.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit5/practice/practicee.jpeg`],
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
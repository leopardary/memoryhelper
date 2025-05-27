const data = {
  "统编版小学语文一年级 - 下册": {
    type: 'module',
    description: '统编版小学语文一年级 - 下册',
    imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/yuwen_1b.jpeg`],
    order: 2,
    data: [{
      "第四单元": {
        type: 'chapter',
        description: '第四单元：课文',
        imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/lesson8/lesson8a.jpeg`],
        order: 4,
        data: [{
          "静夜思": {
            type: 'lesson',
            description: '第八课，静夜思',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/lesson8/lesson8a.jpeg`],
            order: 1,
            data: []
          },
          "夜色": {
            type: 'lesson',
            description: '第九课，夜色',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/lesson9/lesson9a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/lesson9/lesson9b.jpeg`],
            order: 2,
            data: []
          },
          "端午粽": {
            type: 'lesson',
            description: '第十课，端午粽',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/lesson10/lesson10a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/lesson10/lesson10b.jpeg`],
            order: 3,
            data: []
          },
          "彩虹": {
            type: 'lesson',
            description: '第十一课，彩虹',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/lesson11/lesson11a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/lesson11/lesson11b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/lesson11/lesson11c.jpeg`],
            order: 4,
            data: []
          },
          "练习": {
            type: 'lesson',
            description: '练习',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/practice/practicea.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/practice/practiceb.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit4/practice/practicec.jpeg`],
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
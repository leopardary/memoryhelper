const data = {
  "统编版小学语文一年级 - 下册": {
    type: 'module',
    description: '统编版小学语文一年级 - 下册',
    imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/yuwen_1b.jpeg`],
    order: 2,
    data: [{
      "第六单元": {
        type: 'chapter',
        description: '第六单元：课文',
        imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson12/lesson12a.jpeg`],
        order: 6,
        data: [{
          "古诗二首": {
            type: 'lesson',
            description: '第十二课，古诗二首',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson12/lesson12a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson12/lesson12b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson12/lesson12c.jpeg`],
            order: 1,
            data: []
          },
          "荷叶圆圆": {
            type: 'lesson',
            description: '第十三课，荷叶圆圆',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson13/lesson13a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson13/lesson13b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson13/lesson13c.jpeg`],
            order: 2,
            data: []
          },
          "要下雨了": {
            type: 'lesson',
            description: '第十四课，要下雨了',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson14/lesson14a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson14/lesson14b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson14/lesson14c.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/lesson14/lesson14d.jpeg`],
            order: 3,
            data: []
          },
          "练习": {
            type: 'lesson',
            description: '练习',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/practice/practicea.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/practice/practiceb.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/practice/practicec.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/practice/practiced.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit6/practice/practicee.jpeg`],
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
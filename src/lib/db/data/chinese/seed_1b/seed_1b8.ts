const data = {
  "统编版小学语文一年级 - 下册": {
    type: 'module',
    description: '统编版小学语文一年级 - 下册',
    imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/yuwen_1b.jpeg`],
    order: 2,
    data: [{
      "第八单元": {
        type: 'chapter',
        description: '第八单元：课文',
        imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson19/lesson19a.jpeg`],
        order: 8,
        data: [{
          "棉花姑娘": {
            type: 'lesson',
            description: '第十九课，棉花姑娘',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson19/lesson19a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson19/lesson19b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson19/lesson19c.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson19/lesson19d.jpeg`],
            order: 1,
            data: []
          },
          "咕咚": {
            type: 'lesson',
            description: '第二十课，咕咚',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson20/lesson20a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson20/lesson20b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson20/lesson20c.jpeg`],
            order: 2,
            data: []
          },
          "小壁虎借尾巴": {
            type: 'lesson',
            description: '第二十一课，小壁虎借尾巴',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson21/lesson21a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson21/lesson21b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson21/lesson21c.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/lesson21/lesson21d.jpeg`],
            order: 3,
            data: []
          },
          "练习": {
            type: 'lesson',
            description: '练习',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/practice/practicea.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/practice/practiceb.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/practice/practicec.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/practice/practiced.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit8/practice/practicee.jpeg`],
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
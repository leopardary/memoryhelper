const data = {
  "统编版小学语文一年级 - 下册": {
    type: 'module',
    description: '统编版小学语文一年级 - 下册',
    imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/yuwen_1b.jpeg`],
    order: 2,
    data: [{
      "第七单元": {
        type: 'chapter',
        description: '第七单元：课文',
        imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson15/lesson15a.jpeg`],
        order: 7,
        data: [{
          "文具的家": {
            type: 'lesson',
            description: '第十五课，文具的家',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson15/lesson15a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson15/lesson15b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson15/lesson15c.jpeg`],
            order: 1,
            data: []
          },
          "一分钟": {
            type: 'lesson',
            description: '第十六课，一分钟',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson16/lesson16a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson16/lesson16b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson16/lesson16c.jpeg`],
            order: 2,
            data: []
          },
          "动物王国开大会": {
            type: 'lesson',
            description: '第十七课，动物王国开大会',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson17/lesson17a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson17/lesson17b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson17/lesson17c.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson17/lesson17d.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson17/lesson17e.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson17/lesson17f.jpeg`],
            order: 3,
            data: []
          },
          "小猴子下山": {
            type: 'lesson',
            description: '第十八课，小猴子下山',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson18/lesson18a.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson18/lesson18b.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/lesson18/lesson18c.jpeg`],
            order: 4,
            data: []
          },
          "练习": {
            type: 'lesson',
            description: '练习',
            imageUrls: [`${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/practice/practicea.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/practice/practiceb.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/practice/practicec.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/practice/practiced.jpeg`, `${process.env.IMAGE_BASE_PATH}/subjects/yuwen/1b/unit7/practice/practicee.jpeg`],
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
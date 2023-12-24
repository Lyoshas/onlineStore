import { Knex } from 'knex';

function generateImageUrlByUUID(uuid: string): string {
    return `https://onlinestore-product-images.s3.amazonaws.com/${uuid}.png`;
}

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('products').del();

    // to insert a new product, we need to know its category id
    const getCategoryIdSubquery = (categoryName: string) => {
        return knex('product_categories')
            .select('id')
            .where({ category: categoryName });
    };

    // Inserts seed entries
    // Consoles
    await knex('products').insert([
        {
            title: 'Консоль Sony PlayStation 4 Slim 500GB Black',
            price: 12999,
            initial_image_url: generateImageUrlByUUID(
                '0667d9bf-ba25-4743-ac5b-9d94a416a616'
            ),
            additional_image_url: generateImageUrlByUUID(
                'bcd55bb0-aa38-47af-8015-0df8375bc72c'
            ),
            quantity_in_stock: 20,
            short_description:
                'Компактна версія ультрапопулярної ігрової консолі четвертого покоління від Sony. Консоль отримала оновлений дизайн і зменшений корпус. Начинка не зазнала змін. По суті, версія Slim є старою доброю Playstation 4 в новому вигляді.',
            category_id: getCategoryIdSubquery('Ігрові консолі'),
            max_order_quantity: 6,
        },
        {
            title: 'Nintendo Switch OLED Біла',
            price: 17999,
            initial_image_url: generateImageUrlByUUID(
                '7cf3073b-d5b3-489d-a70e-e650b5bff95d'
            ),
            additional_image_url: generateImageUrlByUUID(
                'aa628edc-b5c0-4483-b52f-eaaa3a76efdd'
            ),
            quantity_in_stock: 5,
            short_description:
                'Nintendo Swith OLED - оновлена версія популярної консолі, головною відмінністю якої виступає 7-дюймовий OLED екран з глибокими кольорами і тонкішими рамками. Консоль має висувну регульовану опору, яка дозволить розташувати її під зручним кутом у настільному режимі.',
            category_id: getCategoryIdSubquery('Ігрові консолі'),
            max_order_quantity: 2,
        },
        {
            title: 'PlayStation 5 Ultra HD Blu-ray Call of Duty: Modern Warfare III',
            price: 25499,
            initial_image_url: generateImageUrlByUUID(
                'e97939e5-8a9c-4cf4-b663-f51b57622236'
            ),
            additional_image_url: generateImageUrlByUUID(
                'f1d27468-3f9d-4de1-9c76-2917aeef98f2'
            ),
            quantity_in_stock: 15,
            short_description:
                "Sony PlayStation 5 – нова консоль п'ятого покоління. Значні зміни торкнулися як внутрішнього наповнення, так і дизайну загалом. Ігрова приставка отримала 8 ядерний 16 потоковий процесор на архітектурі AMD Zen 2, продуктивності якої достатньо для гри в роздільній здатності аж до 8K.",
            category_id: getCategoryIdSubquery('Ігрові консолі'),
            max_order_quantity: 5,
        },
        {
            title: 'Консоль Microsoft Xbox Series X 1TB Black',
            price: 19999,
            initial_image_url: generateImageUrlByUUID(
                '47daaba5-f845-458f-9dad-163291a54637'
            ),
            additional_image_url: generateImageUrlByUUID(
                '82802a1a-518e-4ff3-b8ec-a78fbb3116db'
            ),
            quantity_in_stock: 35,
            short_description:
                'Xbox Series X - топ актуальної лінійки консолей 2020 року від компанії Microsoft. Старша версія отримала 8-ядерний процесор Custom Zen 2 з тактовою частотою 3,8 ГГц, а також графічний процесор потужністю в 12 терафлопс, що дозволяє їй запускати ігри в 4К, з фреймрейтом 120 кадрів в секунду.',
            category_id: getCategoryIdSubquery('Ігрові консолі'),
            max_order_quantity: 5,
        },
        {
            title: 'Sony PlayStation 5 Digital Edition 825GB White',
            price: 28999,
            initial_image_url: generateImageUrlByUUID(
                '64d22b21-b6be-4038-b37c-7e5696b7bd14'
            ),
            additional_image_url: generateImageUrlByUUID(
                'a6a8ec93-7d54-493f-9990-eba1fd22c03f'
            ),
            quantity_in_stock: 30,
            short_description:
                "Sony PlayStation 5 – нова консоль п'ятого покоління. Значні зміни торкнулися як внутрішнього наповнення, так і дизайну загалом. Ігрова приставка отримала 8 ядерний 16 потоковий процесор на архітектурі AMD Zen 2, продуктивності якої достатньо для гри в роздільній здатності аж до 8K.",
            category_id: getCategoryIdSubquery('Ігрові консолі'),
            max_order_quantity: 10,
        },
    ]);

    // Laptops
    await knex('products').insert([
        {
            title: 'Apple MacBook Pro 16" M1 Pro 512GB 2021',
            price: 114970,
            initial_image_url: generateImageUrlByUUID(
                '8bd44131-8cc9-4503-9d38-a784e90220f4'
            ),
            additional_image_url: generateImageUrlByUUID(
                '14f5c601-96a6-41f2-a22e-9922bb207376'
            ),
            quantity_in_stock: 20,
            short_description:
                'Екран 16.2" Liquid Retina XDR (3456x2234) 120 Гц, глянсовий / Apple M1 Pro / RAM 16 ГБ / SSD 512 ГБ / Apple M1 Pro Graphics (16 ядер) / без ОД / Wi-Fi / Bluetooth / веб-камера / macOS Monterey / 2.1 кг / сірий',
            category_id: getCategoryIdSubquery('Ноутбуки'),
        },
        {
            title: 'Ноутбук Acer Aspire 7 A715-42G-R5B1',
            price: 36999,
            initial_image_url: generateImageUrlByUUID(
                '255a898a-49da-4df6-88bd-0cf13a44dd2d'
            ),
            additional_image_url: generateImageUrlByUUID(
                '0d51e340-f487-4f58-a25e-35f977eb6098'
            ),
            quantity_in_stock: 5,
            short_description:
                'Екран 15.6" IPS (1920x1080) Full HD 144 Гц, матовий / AMD Ryzen 5 5500U (2.1 - 4.0 ГГц) / RAM 8 ГБ / SSD 512 ГБ / nVidia GeForce RTX 3050, 4 ГБ / без ОД / LAN / Wi-Fi / Bluetooth / веб-камера / без ОС / 2.15 кг / чорний',
            category_id: getCategoryIdSubquery('Ноутбуки'),
            max_order_quantity: 4,
        },
        {
            title: 'Ноутбук ASUS Laptop X515MA-BR874W Transparent Silver',
            price: 14999,
            initial_image_url: generateImageUrlByUUID(
                'f9c0b15a-2f54-49c8-a407-007c4cc1c2cc'
            ),
            additional_image_url: generateImageUrlByUUID(
                '67c8dc18-3347-498c-a61a-028131b2cf69'
            ),
            quantity_in_stock: 20,
            short_description:
                'Екран 15.6" (1366x768) WXGA HD, матовий / Intel Celeron N4020 (1.1 - 2.8 ГГц) / RAM 4 ГБ / SSD 256 ГБ / Intel UHD Graphics 600 / без ОД / Wi-Fi / Bluetooth / веб-камера / Windows 11 / 1.8 кг / сріблястий',
            category_id: getCategoryIdSubquery('Ноутбуки'),
        },
        {
            title: 'Ноутбук Acer Nitro 5 AN515-58-539L Obsidian Black',
            price: 46999,
            initial_image_url: generateImageUrlByUUID(
                'd9735ba1-d2ee-4797-82f3-a231b5890b57'
            ),
            additional_image_url: generateImageUrlByUUID(
                '11de2031-c4c5-4026-ad4a-f7f25feb2323'
            ),
            quantity_in_stock: 20,
            short_description:
                'Екран 15.6" IPS (1920x1080) Full HD 144 Гц, матовий / Intel Core i5-12450H (2.0 - 4.4 ГГц) / RAM 16 ГБ / SSD 512 ГБ / nVidia GeForce RTX 4060, 8 ГБ / без ОД / LAN / Wi-Fi / Bluetooth / веб-камера / без ОС / 2.5 кг / чорний',
            category_id: getCategoryIdSubquery('Ноутбуки'),
        },
        {
            title: 'Ноутбук ASUS TUF Gaming A15 (2022)',
            price: 40999,
            initial_image_url: generateImageUrlByUUID(
                'feb15b65-cf30-4c2d-89df-680947f22db2'
            ),
            additional_image_url: generateImageUrlByUUID(
                '658ec601-db42-4d83-a373-20d113a986f2'
            ),
            quantity_in_stock: 20,
            short_description:
                'Екран 15.6" IPS (1920x1080) Full HD 144 Гц, матовий / AMD Ryzen 7 6800H (3.2 - 4.7 ГГц) / RAM 16 ГБ / SSD 512 ГБ / nVidia GeForce RTX 3060,-6 Bluetooth / веб-камера / без ОС / 2.2 кг / сірий',
            category_id: getCategoryIdSubquery('Ноутбуки'),
        },
    ]);

    // Personal Computers
    await knex('products').insert([
        {
            title: "Комп'ютер ARTLINE Gaming ASUS Edition X43 (X43v33) Ryzen 5 3600/RAM 16ГБ/HDD 1ТБ + SSD 240ГБ/GeForce RTX 3050 8ГБ/Wi-Fi",
            price: 31499,
            initial_image_url: generateImageUrlByUUID(
                'c7d3bf2a-8a81-4201-81ed-f20cb7912ac8'
            ),
            additional_image_url: generateImageUrlByUUID(
                '6732c7f9-ea53-48e5-901d-4faf43612348'
            ),
            quantity_in_stock: 15,
            short_description:
                'AMD Ryzen 5 3600 (3.6 - 4.2 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 240 ГБ / nVidia GeForce RTX 3050, 8 ГБ / без ОД / LAN / Wi-Fi / без ОС',
            category_id: getCategoryIdSubquery("Персональні комп'ютери"),
        },
        {
            title: "Комп'ютер ARTLINE Gaming D31WHITE",
            price: 69999,
            initial_image_url: generateImageUrlByUUID(
                '2ac75197-a539-41eb-a22d-6e686eb53f86'
            ),
            additional_image_url: generateImageUrlByUUID(
                'e735e036-25d1-49b4-9248-1593635cfc5d'
            ),
            quantity_in_stock: 3,
            short_description:
                "AMD Ryzen 5 3600 (3.6 - 4.2 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 240 ГБ / nVidia GeForce RTX 3050, 8 ГБ / без ОД / LAN / Wi-Fi / без ОС'AMD Ryzen 5 3600 (3.6 - 4.2 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 240 ГБ / nVidia GeForce RTX 3050, 8 ГБ / без ОД / LAN / Wi-Fi / без ОС",
            category_id: getCategoryIdSubquery("Персональні комп'ютери"),
        },
        {
            title: "Комп'ютер Cobra Advanced I14F.16.H1S4.166S.6368",
            price: 21999,
            initial_image_url: generateImageUrlByUUID(
                'd779a7dc-8907-4104-8197-6f31b704f441'
            ),
            additional_image_url: generateImageUrlByUUID(
                'c89a36e0-8ee2-4c62-8e5a-4c9ed486f171'
            ),
            quantity_in_stock: 10,
            short_description:
                'Intel Core i5-10400F (2.9 - 4.3 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 480 ГБ / nVidia GeForce GTX 1660 Super, 6 ГБ / без ОД / LAN / без ОС',
            category_id: getCategoryIdSubquery("Персональні комп'ютери"),
        },
        {
            title: "Комп'ютер ARTLINE Gaming X49",
            price: 31999,
            initial_image_url: generateImageUrlByUUID(
                '1cdabb5d-ff26-4f91-aa31-9cec29002e27'
            ),
            additional_image_url: generateImageUrlByUUID(
                'd668406f-de3b-47ff-a58d-a240506b09d5'
            ),
            quantity_in_stock: 15,
            short_description:
                'AMD Ryzen 5 5500 (3.6 - 4.2 ГГц) / RAM 16 ГБ / SSD 1 ТБ / nVidia GeForce RTX 4060 Ti, 8 ГБ / LAN / Без ОД / Без ОС',
            category_id: getCategoryIdSubquery("Персональні комп'ютери"),
        },
        {
            title: "Комп'ютер Lenovo IdeaCentre G5 Gaming 14IOB6",
            price: 17499,
            initial_image_url: generateImageUrlByUUID(
                '07671810-c54a-424b-a0d1-4f2080731009'
            ),
            additional_image_url: generateImageUrlByUUID(
                '5d4db200-9683-4723-bb17-60f032812b8a'
            ),
            quantity_in_stock: 18,
            short_description:
                'Intel Core i5-10400F (2.9 — 4.3 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 256 ГБ / nVidia GeForce GTX 1650 Super, 4 ГБ / без ОД / LAN / Wi-Fi / Bluetooth / без ОС',
            category_id: getCategoryIdSubquery("Персональні комп'ютери"),
        },
    ]);

    // Tablets
    await knex('products').insert([
        {
            title: 'Samsung Galaxy Tab S7 FE 12.4" 4/64GB Wi-Fi Black',
            price: 17999,
            initial_image_url: generateImageUrlByUUID(
                '52816822-d7d4-4c98-b815-47a516751f6b'
            ),
            additional_image_url: generateImageUrlByUUID(
                '91a8b546-4a4e-407a-9b74-14c7c7751652'
            ),
            quantity_in_stock: 2,
            short_description:
                'Екран 12.4" (2560x1600) MultiTouch / Qualcomm Snapdragon 778G (2.4 ГГц) / RAM 4 ГБ / 64 ГБ вбудованої пам\'яті + microSD / Wi-Fi / Bluetooth 5.0 / основна камера: 8 Мп, фронтальна - 5 Мп / GPS / ГЛОНАСС / Android / 608 г / чорний',
            category_id: getCategoryIdSubquery('Планшети'),
        },
        {
            title: 'Samsung Galaxy Tab A7 Lite Wi-Fi 32GB Grey',
            price: 4799,
            initial_image_url: generateImageUrlByUUID(
                '1dff3459-971a-4080-b654-64271ece995c'
            ),
            additional_image_url: generateImageUrlByUUID(
                '01e70f7b-b694-49bc-8405-4a6ecfcdb0e2'
            ),
            quantity_in_stock: 30,
            short_description:
                'Екран 8.7" (1340x800) MultiTouch/MediaTek Helio P22T (2.3 ГГц)/RAM 3 ГБ/32 ГБ вбудованої пам\'яті + microSD/Wi-Fi/Bluetooth 5.0/основна камера 8 Мп, фронтальна — 2 Мп/GPS/ГЛОНАСС/Android /366 г/сірий',
            category_id: getCategoryIdSubquery('Планшети'),
        },
        {
            title: 'Планшет Apple iPad 10.2" 2021 Wi-Fi 64 GB Silver',
            price: 13999,
            initial_image_url: generateImageUrlByUUID(
                '1e5ded47-e9c5-4f41-a609-c61762d5eed3'
            ),
            additional_image_url: generateImageUrlByUUID(
                '24d35c93-cdf6-41bd-9094-5539cc0d28fe'
            ),
            quantity_in_stock: 19,
            short_description:
                'Екран 10.2" IPS (2160x1620) MultiTouch / Apple A13 Bionic (2.65 ГГц) / 64 ГБ вбудованої пам\'яті / Wi-Fi / Bluetooth 4.2 / основна камера 8 Мп, фронтальна — 12 Мп / iPadOS 15 / 487 г / сірий космос',
            category_id: getCategoryIdSubquery('Планшети'),
        },
        {
            title: 'Планшет Oscal Pad 13 8/256GB LTE Space Grey',
            price: 6999,
            initial_image_url: generateImageUrlByUUID(
                '617ca33b-2521-4764-af7e-06a5e892ae6e'
            ),
            additional_image_url: generateImageUrlByUUID(
                'a18a7020-e72c-467f-89b2-85940fc969da'
            ),
            quantity_in_stock: 12,
            short_description:
                'Екран 10.1" IPS (1920х1200) MultiTouch / Unisoc T606 (1.6 ГГц) / RAM 8 ГБ / 256 ГБ вбудованої пам\'яті + microSD / 3G / 4G / Wi-Fi / Bluetooth / основна камера 13 Мп / фронтальна - 8 Мп / Android 435 г/сірий',
            category_id: getCategoryIdSubquery('Планшети'),
        },
        {
            title: 'Планшет Samsung Galaxy Tab S9 FE Wi-Fi 6/128GB Silver',
            price: 6999,
            initial_image_url: generateImageUrlByUUID(
                'daa2bff9-99b4-4252-9d81-47854b5a1df6'
            ),
            additional_image_url: generateImageUrlByUUID(
                'e23e99c0-f090-4218-a416-8af037a08dd8'
            ),
            quantity_in_stock: 42,
            short_description:
                'Екран 10.9" (2304 x 1440) MultiTouch / Samsung Exynos 1380 (2.4 ГГц) / RAM 6 ГБ / 128 ГБ вбудованої пам\'яті + microSD / Wi-Fi / Bluetooth 5.3 / основна камера: 8 Мп, фронтальна - 12 Мп / Android 13 / 523 г / сірий',
            category_id: getCategoryIdSubquery('Планшети'),
        },
    ]);

    // Smartphones
    await knex('products').insert([
        {
            title: 'Motorola G32 6/128GB Grey',
            price: 6999,
            initial_image_url: generateImageUrlByUUID(
                '3d87fc8e-eed4-4bdd-9020-4aa99d85d244'
            ),
            additional_image_url: generateImageUrlByUUID(
                'f1a9e141-1b95-4519-9a5f-f67c401da8a0'
            ),
            quantity_in_stock: 16,
            short_description:
                'Motorola G32 з потужною системою камер 50 Мп, 6.5-дюймовим ультрашироким FullHD+ дисплеєм і багатовимірним звуком Dolby Atmos забезпечує отримання унікального користувальницького досвіду. Продуктивний процесор Qualcomm Snapdragon 680 гарантує надшвидку роботу всіх додатків.',
            category_id: getCategoryIdSubquery('Смартфони'),
        },
        {
            title: 'Мобільний телефон Samsung Galaxy A24 6/128GB Black',
            price: 7999,
            initial_image_url: generateImageUrlByUUID(
                'b6c17997-ea8d-4535-9502-2b8f770191fc'
            ),
            additional_image_url: generateImageUrlByUUID(
                '05cf4529-162b-43fe-bf93-e12d0105ee70'
            ),
            quantity_in_stock: 24,
            short_description:
                'Екран (6.5", Super AMOLED, 2340x1080) / Mediatek Helio G99 (2 x 2.6 ГГц + 6 x 2.0 ГГц) / основна потрійна камера: 50 Мп + 5 Мп + 2 Мп, фронтальна камера: 13 Мп / RAM 6 ГБ / 128 ГБ вбудованої пам\'яті / 3G / LTE / GPS / ГЛОНАСС / BDS / підтримка 2х SIM-карток (Nano-SIM) / Android 13 / 5000 мА * год',
            category_id: getCategoryIdSubquery('Смартфони'),
        },
        {
            title: 'Мобільний телефон Apple iPhone 15 128GB Pink',
            price: 38499,
            initial_image_url: generateImageUrlByUUID(
                '48ec71b2-d580-4473-924b-a4746c2d318a'
            ),
            additional_image_url: generateImageUrlByUUID(
                '75915fe9-a948-45e6-8353-2f775aa196a6'
            ),
            quantity_in_stock: 8,
            short_description:
                'Екран (6.1", OLED (Super Retina XDR), 2556x1179) / Apple A16 Bionic / подвійна основна камера: 48 Мп + 12 Мп, фронтальна камера: 12 Мп / 128 ГБ вбудованої пам\'яті / 3G / LTE / 5G / GPS / Nano-SIM / iOS 17',
            category_id: getCategoryIdSubquery('Смартфони'),
        },
        {
            title: 'Мобільний телефон Apple iPhone 12 128GB Purple',
            price: 25499,
            initial_image_url: generateImageUrlByUUID(
                'ca5a9779-27bf-4b0a-bfd5-9c63db316569'
            ),
            additional_image_url: generateImageUrlByUUID(
                '988eb696-0550-40b9-91ee-9a27c399bada'
            ),
            quantity_in_stock: 15,
            short_description:
                'Екран (6.1", OLED (Super Retina XDR), 2532x1170) / Apple A14 Bionic / подвійна основна камера: 12 Мп + 12 Мп, фронтальна камера: 12 Мп / 128 ГБ вбудованої пам\'яті / 3G / LTE / 5G / GPS / Nano-SIM, eSIM / iOS 14',
            category_id: getCategoryIdSubquery('Смартфони'),
        },
        {
            title: 'Мобільний телефон Honor Magic5 Lite 5G 8/256GB Midnight Black',
            price: 9999,
            initial_image_url: generateImageUrlByUUID(
                '032ad239-e8d2-42c1-a9ae-00343a31b0b4'
            ),
            additional_image_url: generateImageUrlByUUID(
                '39b6dd1b-9803-470c-af81-8f6f33d1fd38'
            ),
            quantity_in_stock: 32,
            short_description:
                'Екран (6.67", AMOLED, 2400x1080) / Qualcomm Snapdragon 695 (2.2 ГГц + 1.8 ГГц) / основна потрійна камера: 64 Мп + 5 Мп + 2 Мп, фронтальна камера: 16 Мп / RAM 8 ГБ / 256 ГБ вбудованої пам\'яті / 3G / LTE / 5G / GPS / підтримка 2-х SIM-карт (Nano-SIM) / Android 12 / 5100 мА * год',
            category_id: getCategoryIdSubquery('Смартфони'),
        },
    ]);

    // HDD
    await knex('products').insert([
        {
            title: 'Жорсткий диск Seagate Basic 2TB 2.5 USB 3.0 External Gray',
            price: 2699,
            initial_image_url: generateImageUrlByUUID(
                'f49bcae1-c3a1-433f-9dfb-8ba611cc209e'
            ),
            additional_image_url: generateImageUrlByUUID(
                'b1acdc2c-10f3-46d6-a077-ab8f55517a71'
            ),
            quantity_in_stock: 15,
            short_description:
                'Seagate Basic 2 TB Gray (STJL2000400) - зовнішній жорсткий диск, який дозволяє зручно транспортувати з собою великі обсяги даних. Виготовлений в форматі 2,5-дюйма пристрій поміщено в практичний пластиковий корпус, який захищає його від пилу, подряпин і незначних ударів.',
            category_id: getCategoryIdSubquery('HDD'),
            max_order_quantity: 20,
        },
        {
            title: 'Жорсткий диск Transcend StoreJet 25M3C 4 TB TS4TSJ25M3C 2.5" USB 3.1 Type-C External',
            price: 2699,
            initial_image_url: generateImageUrlByUUID(
                'b02cdc18-18ee-4847-995d-5bdd6c1a873f'
            ),
            additional_image_url: generateImageUrlByUUID(
                'ba806549-5370-4b14-a1ef-c02ca27ec436'
            ),
            quantity_in_stock: 15,
            short_description:
                'Міцний портативний жорсткий диск StoreJet 25M3C від Transcend оснащений інтерфейсом USB 3.1 Gen 1 і портом USB Type-C для неперевершеної швидкості передачі даних, а також кабелем USB Type-C і кабелем Type-C до Type-A для максимальної сумісності з різними пристроями.',
            category_id: getCategoryIdSubquery('HDD'),
            max_order_quantity: 20,
        },
        {
            title: 'Western Digital Blue 1TB 7200rpm 64MB',
            price: 1529,
            initial_image_url: generateImageUrlByUUID(
                '9a62d620-5a6d-445f-94e1-d8f30730d923'
            ),
            additional_image_url: generateImageUrlByUUID(
                '33da72f1-77c0-4254-8eda-cfc83b484760'
            ),
            quantity_in_stock: 15,
            short_description:
                'Жорсткий диск WD Blue WD10EZEX є одним з найяскравіших представників серії накопичувачів WD Blue. Відмінною рисою даного жорсткого диска є використання всього однієї пластини ємністю 1 ТБ з частотою обертання 7200 об/хв.',
            category_id: getCategoryIdSubquery('HDD'),
        },
        {
            title: 'Жорсткий диск Seagate SkyHawk HDD 1TB 5900rpm 64MB ST1000VX005 3.5 SATAIII',
            price: 1949,
            initial_image_url: generateImageUrlByUUID(
                '770e12ed-584a-4715-9177-2b02eb2d4c0e'
            ),
            additional_image_url: generateImageUrlByUUID(
                '55dcafce-9360-4262-b769-227bd7ac2db8'
            ),
            quantity_in_stock: 2,
            short_description:
                'Диски Seagate SkyHawk HDD 1TB 5900rpm 64MB ST1000VX005 3.5 SATAIII добре підходять для багатодискових систем і при потребі легко масштабуються. Завдяки оптимізації для RAID-масивів накопичувачі забезпечують довготривалу роботу систем відеоспостереження без втрати даних.',
            category_id: getCategoryIdSubquery('HDD'),
            max_order_quantity: 10,
        },
        {
            title: 'Жорсткий диск Western Digital Gold 2TB 7200rpm 128MB WD2005FBYZ 3.5" SATA III',
            price: 5069,
            initial_image_url: generateImageUrlByUUID(
                '294a48e3-f824-4111-942d-548ebc201171'
            ),
            additional_image_url: generateImageUrlByUUID(
                '608fbeab-1345-43a2-bf91-a85f6fb4da63'
            ),
            quantity_in_stock: 22,
            short_description:
                "Виконуючи свої функціональні обов'язки, жорсткий диск WD Gold (WD2005FBYZ) обертає шпиндель зі швидкістю до 7200 обертів в хвилину, оперуючи при цьому 128 МБ кеш і 2 ТБ основний пам'яті і використовуючи SATA III 6Gb/s інтерфейс.",
            category_id: getCategoryIdSubquery('HDD'),
            max_order_quantity: 20,
        },
    ]);

    // SSD
    await knex('products').insert([
        {
            title: 'SSD диск Kingston A400 480GB 2.5" SATAIII 3D V-NAND (SA400S37/480G)',
            price: 1349,
            initial_image_url: generateImageUrlByUUID(
                '7522c9ff-b2a9-4a44-aab2-069f11a8873b'
            ),
            additional_image_url: generateImageUrlByUUID(
                '9e8253da-26c7-4c6a-93bb-00f27e1128cd'
            ),
            quantity_in_stock: 12,
            short_description:
                'Максимальна швидкість читання SSD накопичувача Kingston SSDNow A400 480 GB (SA400S37/480G) може доходити до 500 МБ/с, тоді як запис забезпечується 450 МБ/с. Така швидкодія можлива завдяки SATA rev. 3.0 інтерфейсу, через який пристрій підключається до системи.',
            category_id: getCategoryIdSubquery('SSD'),
            max_order_quantity: 7,
        },
        {
            title: 'SSD диск Kingston NV2 1TB M.2 2280 NVMe PCIe 4.0 x4 (SNV2S/1000G)',
            price: 2249,
            initial_image_url: generateImageUrlByUUID(
                'e23ef8b2-2249-4265-9f50-ae842d9f4b94'
            ),
            additional_image_url: generateImageUrlByUUID(
                '43d023d4-c2e3-4657-b104-0e63bb270bad'
            ),
            quantity_in_stock: 1,
            short_description:
                'Kingston NV2 1 TB (SNV2S/1000G) - це твердотільний накопичувач форм-фактора M.2 2280 з інтерфейсом NVMe PCIe Gen 4.0 x4. Він має ємність 1 ТБ і забезпечує швидкості читання і запису до 3500 і 2100 МБ/с відповідно.',
            category_id: getCategoryIdSubquery('SSD'),
            max_order_quantity: 320,
        },
        {
            title: 'SSD диск Samsung 870 Evo-Series 500GB 2.5" SATA III V-NAND 3bit MLC (TLC)',
            price: 2099,
            initial_image_url: generateImageUrlByUUID(
                'caa15e38-892e-4423-9739-e74555334782'
            ),
            additional_image_url: generateImageUrlByUUID(
                'd3444b58-b3d3-4858-ba07-9a24bd323d4c'
            ),
            quantity_in_stock: 145,
            short_description:
                "Samsung 870 EVO 500 GB (MZ-77E500BW) - один з кращих і найпопулярніших твердотільних накопичувачів на ринку з об'ємом пам'яті в 500 ГБ. Він поєднує в собі високу швидкість роботи і відмінну надійність, завдяки чому добре підходить під потреби широкого числа користувачів.",
            category_id: getCategoryIdSubquery('SSD'),
            max_order_quantity: 10,
        },
        {
            title: 'SSD диск Apacer AS340X 120GB 2.5" SATAIII 3D NAND',
            price: 429,
            initial_image_url: generateImageUrlByUUID(
                '1d7b3f01-fbbf-48e6-a508-9783a27cc415'
            ),
            additional_image_url: generateImageUrlByUUID(
                'f67df879-58d4-4cc7-b697-1b3ee234e3bd'
            ),
            quantity_in_stock: 30,
            short_description:
                'SSD накопичувач Apacer AS340X 120 GB є ідеальним рішенням для тих, хто хоче покращити продуктивність свого компютера або ноутбука. Даний SSD накопичувач має ємність 120 ГБ, що забезпечує достатньо дискретного простору для зберігання основних файлів, фільмів, музики, зображень та інших даних.',
            category_id: getCategoryIdSubquery('SSD'),
        },
        {
            title: 'SSD диск Kingston KC3000 1TB M.2 2280 NVMe PCIe Gen 4.0 x4 3D TLC NAND (SKC3000S/1024G)',
            price: 3199,
            initial_image_url: generateImageUrlByUUID(
                '564a7f3b-c26c-4516-ae64-ff1874edd404'
            ),
            additional_image_url: generateImageUrlByUUID(
                '65950bef-58c4-4248-8b83-5f9161711889'
            ),
            quantity_in_stock: 90,
            short_description:
                'Kingston KC3000 SKC3000D/1024G - це SSD-накопичувач PCIe 4.0 NVMe M.2, який забезпечує швидкість зчитування і запису даних до 7000 МБ/с. Цей накопичувач ідеально підходить для систем, які вимагають високої продуктивності для таких завдань, як ігри, редагування відео та створення контенту.',
            category_id: getCategoryIdSubquery('SSD'),
        },
    ]);

    // CPU
    await knex('products').insert([
        {
            title: 'Процесор AMD Ryzen 5 4600G 3.7GHz/8MB (100-100000147BOX) sAM4 BOX',
            price: 4545,
            initial_image_url: generateImageUrlByUUID(
                '63e4c4bd-e259-4cb9-a029-ca93118d0786'
            ),
            additional_image_url: generateImageUrlByUUID(
                '69242d1d-959d-486a-9837-207488b8604a'
            ),
            quantity_in_stock: 120,
            short_description:
                'Призначення - Для настільного ПК / Сокет - AM4 / Внутрішня тактова частота (ГГц) - 3,7 - 4,2 / Сімейство процесора - Ryzen 5 / Тип упаковки (Box, Tray, Multipack) - Box',
            category_id: getCategoryIdSubquery('Процесори'),
        },
        {
            title: 'Процесор Intel Core i9-13900KF 3.0GHz/36MB (BX8071513900KF) s1700 BOX',
            price: 23199,
            initial_image_url: generateImageUrlByUUID(
                '6a9c7042-b920-4de3-a33a-50a014d45f50'
            ),
            additional_image_url: generateImageUrlByUUID(
                'a2252541-c677-458a-a51c-706bc6d376e7'
            ),
            quantity_in_stock: 15,
            short_description:
                'Процесор Intel Core i9-13900KF (BX8071513900KF) (8 продуктивних ядер 3.0-5.4 GHz, 16 ефективних ядер 2.2-4.3 GHz, Turbo Boost Max 5.8 GHz, 24 ядра, без графічного ядра, 36Мб Cache, 89.6 GB/s, 125W-253W, Box, без кулера, s1700)',
            category_id: getCategoryIdSubquery('Процесори'),
        },
        {
            title: 'Процесор Intel Core i5-14600KF 4.0GHz/24MB (BX8071514600KF) s1700 BOX',
            price: 23199,
            initial_image_url: generateImageUrlByUUID(
                '6a9c7042-b920-4de3-a33a-50a014d45f50'
            ),
            additional_image_url: generateImageUrlByUUID(
                'a2252541-c677-458a-a51c-706bc6d376e7'
            ),
            quantity_in_stock: 15,
            short_description:
                "Для настільного комп'ютера/Intel Socket 1700/14 ядер/20 потоків/Raptor Lake-S/Чотирнадцяте покоління/тактова частота 3,5-5,3 ГГц/L1-кеш 1248 КБ, L2-кеш 20480 КБ",
            category_id: getCategoryIdSubquery('Процесори'),
        },
        {
            title: 'Процесор Intel Core i3-10100F 3.6 GHz / 6 MB (BX8070110100F) s1200 BOX',
            price: 3187,
            initial_image_url: generateImageUrlByUUID(
                '72bb8842-5f8c-4478-b328-6ca657c0b44d'
            ),
            additional_image_url: generateImageUrlByUUID(
                '7dc0335c-92cf-499a-954b-5e675a8834ec'
            ),
            quantity_in_stock: 28,
            short_description:
                "Для настільного комп'ютера/Intel Socket 1200/4 ядра/8 потоків/Comet Lake/Десяте покоління/тактова частота 3,6-4,3 ГГц/L3-кеш 6 МБ",
            category_id: getCategoryIdSubquery('Процесори'),
        },
        {
            title: 'Процесор AMD Ryzen 5 3600 3.6 GHz / 32 MB (100-000000031) sAM4 OEM',
            price: 3058,
            initial_image_url: generateImageUrlByUUID(
                'd10dc851-a174-4ea6-9c9c-7a86a01246bd'
            ),
            additional_image_url: generateImageUrlByUUID(
                'af9d4987-f647-4969-b6d2-6cc0d4d787b7'
            ),
            quantity_in_stock: 60,
            short_description:
                "Для настільного комп'ютера/AMD Socket AM4/6 ядер/12 потоків/Zen 2/тактова частота 3,6-4,2 ГГц/L3-кеш 32 МБ",
            category_id: getCategoryIdSubquery('Процесори'),
        },
    ]);

    // GPU
    await knex('products').insert([
        {
            title: 'Відеокарта Asus PCI-Ex GeForce RTX 3060 Dual OC V2 LHR 12GB GDDR6 (192bit)',
            price: 13299,
            initial_image_url: generateImageUrlByUUID(
                'a3882f87-1cb6-4799-9a7c-4e139f346910'
            ),
            additional_image_url: generateImageUrlByUUID(
                '6505ee80-deae-443b-935e-fda487d148ba'
            ),
            quantity_in_stock: 30,
            short_description:
                'ASUS RTX 3060 - одна з найбільш універсальних і збалансованих ігрових відеокарт в лінійці компанії за 2020 рік. ASUS RTX 3060 здатна легко справлятися з сучасними іграми на високих налаштуваннях графіки при включеному трасуванні променів, а також радувати високою продуктивністю в робочих завданнях.',
            category_id: getCategoryIdSubquery('Відеокарти'),
            max_order_quantity: 5,
        },
        {
            title: 'ASUS PCI-Ex GeForce RTX 4070 Ti ROG Strix 12GB GDDR6X (192bit)',
            price: 41449,
            initial_image_url: generateImageUrlByUUID(
                'c4fd932d-0395-4a88-b0b6-ff75f00fd2ab'
            ),
            additional_image_url: generateImageUrlByUUID(
                '13ee0132-51b8-4713-ab34-78362f05a43e'
            ),
            quantity_in_stock: 56,
            short_description:
                'ASUS GeForce RTX 4070 Ti - потужна PCI-Ex відеокарта з передовими технологіями, неймовірною графікою та високою продуктивністю для ігор та важких завдань.',
            category_id: getCategoryIdSubquery('Відеокарти'),
            max_order_quantity: 2,
        },
        {
            title: 'Asus PCI-Ex GeForce RTX 2060 Dual EVO OC Edition 6GB GDDR6',
            price: 14799,
            initial_image_url: generateImageUrlByUUID(
                'bebfb189-c1f5-4b53-a47b-9ba97081025f'
            ),
            additional_image_url: generateImageUrlByUUID(
                'b624d139-5ed5-4844-9d55-cb6c34e87e1d'
            ),
            quantity_in_stock: 30,
            short_description:
                'Відеокарта ASUS Dual GeForce RTX 2060 EVO відзначається лаконічним дизайном і високою швидкодією.',
            category_id: getCategoryIdSubquery('Відеокарти'),
            max_order_quantity: 1,
        },
        {
            title: 'Відеокарта ASUS PCI-Ex GeForce RTX 4060 Ti ProArt OC Edition 16GB GDDR6 (128bit)',
            price: 23409,
            initial_image_url: generateImageUrlByUUID(
                'f1e71fdc-d4cd-43b6-b06a-4b0cb8e0bc62'
            ),
            additional_image_url: generateImageUrlByUUID(
                '061857d5-6a80-473d-9d40-d336d5da74f1'
            ),
            quantity_in_stock: 0,
            short_description:
                'ProArt GeForce RTX 4060 Ti OC Edition 16 ГБ GDDR6 привносить елегантний і мінімалістичний стиль, щоб розширити можливості збірок ПК для творців із повномасштабною продуктивністю GeForce RTX 40 Series.',
            category_id: getCategoryIdSubquery('Відеокарти'),
            max_order_quantity: 5,
        },
        {
            title: 'Відеокарта Gigabyte PCI-Ex GeForce RTX 4060 Ti Eagle 8GB GDDR6 (128bit)',
            price: 18999,
            initial_image_url: generateImageUrlByUUID(
                '762ff6c0-fa1d-425c-a9d5-b0c6ec7811ef'
            ),
            additional_image_url: generateImageUrlByUUID(
                '27f9785e-8136-4de5-abc1-b3e05ec16011'
            ),
            quantity_in_stock: 21,
            short_description:
                'GIGABYTE RTX 4060 Ti EAGLE: 8GB GDDR6, 18 TFLOPS, PCIe 4.0, 256-bit шина, висока ефективність та енергоефективність у графічних завданнях та іграх.',
            category_id: getCategoryIdSubquery('Відеокарти'),
            max_order_quantity: 2,
        },
    ]);

    await knex('products').insert([
        {
            title: "Оперативна пам'ять Kingston Fury DDR4-3200 16384 MB PC4-25600 (Kit of 2x8192) Beast RGB Black (KF432C16BBAK2/16)",
            price: 1999,
            initial_image_url: generateImageUrlByUUID(
                'e0359f74-b242-408f-a22f-fca7d7659c88'
            ),
            additional_image_url: generateImageUrlByUUID(
                '474da21b-935c-4170-92d9-03f5e071170c'
            ),
            quantity_in_stock: 50,
            short_description:
                "Оперативна пам'ять Kingston FURY 16GB 2x8GB DDR4 3200 MHz Beast RGB KF432C16BBAK216 - це ідеальний вибір для тих, хто шукає надійну і швидку память для свого настільного компютера. Ці модулі памяті на базі DDR4 розроблені спеціально для геймерів та професіоналів у галузі зображення і відео.",
            category_id: getCategoryIdSubquery("Оперативна пам'ять"),
            max_order_quantity: 2,
        },
        {
            title: "Оперативна пам'ять G.Skill DDR4-3600 65536 MB PC4-28800 (Kit of 2x32768) Trident Z Neo (F4-3600C18D-64GTZN)",
            price: 7058,
            initial_image_url: generateImageUrlByUUID(
                '63eabc1f-1a19-4e9b-a268-72cb7cb72b6d'
            ),
            additional_image_url: generateImageUrlByUUID(
                '4e199e7c-9dae-45a6-bdcd-35411cd9baf4'
            ),
            quantity_in_stock: 21,
            short_description:
                "Спираючись на великий успіх серії G.SKILL Trident Neo, серія Trident Z Neo являє собою одну з найбільш високопродуктивних в світі пам'яттю DDR4, розроблену для ентузіастів розгону та екстремальних геймерів.",
            category_id: getCategoryIdSubquery("Оперативна пам'ять"),
            max_order_quantity: 4,
        },
        {
            title: "Оперативна пам'ять Corsair DDR4-3200 32768MB PC4-25600 (Kit of 2x16384) Vengeance LPX Black (CMK32GX4M2E3200C16)",
            price: 2855,
            initial_image_url: generateImageUrlByUUID(
                'c8c3ced1-2697-40a0-91b3-a90ad6f86e59'
            ),
            additional_image_url: generateImageUrlByUUID(
                '3c7a4049-b1c0-4157-8499-88cb13d46723'
            ),
            quantity_in_stock: 54,
            short_description:
                "Модуль пам'яті VENGEANCE LPX розроблений для високоефективного розгону процесора. Тепловідведення виконане з чистого алюмінію, що прискорює розсіювання тепла, а індивідуально розроблена високопродуктивна друкована плата сприяє більш ефективному розподілу тепла і забезпечує можливості для розгону.",
            category_id: getCategoryIdSubquery("Оперативна пам'ять"),
            max_order_quantity: 20,
        },
        {
            title: "Оперативна пам'ять Kingston Fury SODIMM DDR4-3200 16384 MB PC4-25600 Impact Black (KF432S20IB/16)",
            price: 1399,
            initial_image_url: generateImageUrlByUUID(
                '71057f04-f78d-464e-9df2-87b0dd2ab6e6'
            ),
            additional_image_url: generateImageUrlByUUID(
                '096ff9d2-7d1c-46ed-b1f0-6343e3262416'
            ),
            quantity_in_stock: 36,
            short_description:
                "Цей модуль оперативної пам'яті призначений для ноутбуків і відзначається високою продуктивністю. Використовуйте всі ресурси пам’яті свого комп’ютера і підвищіть продуктивність під час ігор, виконання декількох завдань одночасно і візуалізації.",
            category_id: getCategoryIdSubquery("Оперативна пам'ять"),
            max_order_quantity: 98,
        },
        {
            title: "Оперативна пам'ять Kingston Fury DDR4-3200 16384MB PC4-25600 (Kit of 2x8192)",
            price: 2465,
            initial_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/3be0376f-3e01-4f46-a93e-6119a50bec5b.png',
            additional_image_url:
                'https://onlinestore-product-images.s3.amazonaws.com/705cba7c-f841-4253-a010-4a9e693a62c1.png',
            quantity_in_stock: 15,
            short_description:
                "Складається з двох односторонніх 8-чіпових модулів (2х8 Гб) зі штатними таймінгами CL16 та підтримкою технології XMP з вшитими профілями розгону пам'яті.",
            category_id: getCategoryIdSubquery("Оперативна пам'ять"),
            max_order_quantity: 2,
        },
    ]);

    // Monitors
    await knex('products').insert([
        {
            title: 'Монітор 24" Samsung LF24T450 Black',
            price: 6399,
            initial_image_url: generateImageUrlByUUID(
                '7f5e2915-66f7-45e0-9802-775db86b86dd'
            ),
            additional_image_url: generateImageUrlByUUID(
                'e5509eeb-1190-4e8a-b57e-6d45ceacb65c'
            ),
            quantity_in_stock: 0,
            short_description:
                'Samsung F24T450F Black (LF24T450F) – елегантний монітор середнього цінового сегменту, який пропонує досить високу якість зображення. Модель отримала строгий та практичний дизайн, а функціональна підставка підтримує регулювання кута нахилу, висоти та має можливість повороту у портретний режим.',
            category_id: getCategoryIdSubquery('Монітори'),
        },
        {
            title: 'Монітор ASUS 24” VY249HGE (90LM06A5-B02370) IPS FHD 144Гц / 8-Bit / Adaptive Sync / Freesync Premium',
            price: 5999,
            initial_image_url: generateImageUrlByUUID(
                '0d55e972-3c3f-4b2d-b6d8-01ff6647b97c'
            ),
            additional_image_url: generateImageUrlByUUID(
                'ba43a052-b64a-4b90-9678-dc8aeb08ef3f'
            ),
            quantity_in_stock: 21,
            short_description:
                'Отримайте додаткову перевагу за допомогою ігрового монітора ASUS VY249HGE. Дозвольте собі захопитися вірно відтвореними кольорами. Блискавична реакція матриці та швидкість відображення робить зображення більш плавним, даючи вам більше часу на реакцію та дозволяючи точніше прицілюватися.',
            category_id: getCategoryIdSubquery('Монітори'),
            max_order_quantity: 2,
        },
        {
            title: 'Монітор 25" ASRock CL25FF FHD IPS',
            price: 4099,
            initial_image_url: generateImageUrlByUUID(
                '68808e7f-d461-4a5b-bfdf-915f05b692d7'
            ),
            additional_image_url: generateImageUrlByUUID(
                '4b7818b9-5637-4b81-b9b5-659524c04858'
            ),
            quantity_in_stock: 400,
            short_description:
                'ASRock / 24.5" / Full HD 1920x1200 / IPS / 100Hz / 1ms (MPRT) / 16:9 / 300 cd/m² / 1 300:1 / 18W / 100x100 / CL25FF',
            category_id: getCategoryIdSubquery('Монітори'),
            max_order_quantity: 500,
        },
        {
            title: 'Монітор 23.5" Samsung Curved LS24C366 (LS24C366EAIXCI)',
            price: 4099,
            initial_image_url: generateImageUrlByUUID(
                'ce603c5e-0912-4213-9950-67153c24276f'
            ),
            additional_image_url: generateImageUrlByUUID(
                '1d785a87-89dc-4f9c-8091-7509af544804'
            ),
            quantity_in_stock: 56,
            short_description:
                'Вигнутий екран монітора покликаний змінити ваші уявлення про перегляд розважального контенту або роботи. Завдяки його вигнутій матриці створюється ширше поле зору, через що його екран здається більшим, ніж екран плоского монітора аналогічної діагоналі.',
            category_id: getCategoryIdSubquery('Монітори'),
            max_order_quantity: 21,
        },
        {
            title: 'Монітор 23.8" Acer K243YEbmix (UM.QX3EE.E01) FHD',
            price: 3799,
            initial_image_url: generateImageUrlByUUID(
                '7d44a3b3-79ee-4a8d-9abc-3237437085f3'
            ),
            additional_image_url: generateImageUrlByUUID(
                '85c74d85-d842-4930-bdb9-6dfc2fc9248e'
            ),
            quantity_in_stock: 12,
            short_description:
                'IPS / 100Hz / 1ms VRB / 6-Bit+FRC / 99% sRGB / AMD FreeSync / Low Dimming / Flicker-Less / Speaker 2W',
            category_id: getCategoryIdSubquery('Монітори'),
            max_order_quantity: 23,
        },
    ]);

    // Drones
    await knex('products').insert([
        {
            title: 'Квадрокоптер DJI Mini 4 Pro with RC-N2 Remote Controller',
            price: 35499,
            initial_image_url: generateImageUrlByUUID(
                'cff1d10c-f5d5-4907-8b13-8d89dafb648d'
            ),
            additional_image_url: generateImageUrlByUUID(
                'f44e4b23-e00c-4d85-8d61-0c5cf6d5df01'
            ),
            quantity_in_stock: 200,
            short_description:
                'Літайте безпечніше й далі, ніж будь-коли раніше, з дроном Mini 4 Pro з контролером RC-N2 від DJ. Порівняно з останнім поколінням було зроблено суттєві оновлення. Замість тринаправленого, Mini 4 Pro має всенаправлене уникнення перешкод для повного захисту.',
            category_id: getCategoryIdSubquery('Дрони'),
        },
        {
            title: 'Квадрокоптер DJI Mavic 3 Pro Fly More Combo з пультом DJI RC Pro (CP.MA.00000662.01)',
            price: 125999,
            initial_image_url: generateImageUrlByUUID(
                '8ff718c5-d52e-4b7d-826f-4f375afbeafd'
            ),
            additional_image_url: generateImageUrlByUUID(
                'edde9403-b3bc-4849-a259-f2660f91c1db'
            ),
            quantity_in_stock: 100,
            short_description:
                'DJI Mavic 3 Pro – це втілення передових технологій у галузі аерозйомки. Обладнаний потужною камерою з визначними характеристиками, включаючи роздільну здатність 5,1K. Mavic 3 Pro створює чудові зображення з високою деталізацією та природною кольоровою гамою.',
            category_id: getCategoryIdSubquery('Дрони'),
        },
        {
            title: 'Квадрокоптер DJI Mini 2 Fly More Combo (CP.MA.00000307.01)',
            price: 25617,
            initial_image_url: generateImageUrlByUUID(
                '550a7150-5684-4f21-ab69-5d18d47ae913'
            ),
            additional_image_url: generateImageUrlByUUID(
                'f2719a17-4098-4632-a3d3-68afe30e4cc2'
            ),
            quantity_in_stock: 53,
            short_description:
                'Квадрокоптер DJI Mini 2 Combo (CP.MA.00000307.01) допоможе зберегти дійсно унікальні спогади в високоякісних фотографіях і відео з подорожей або відпустки. Завдяки максимальному часу автономної роботи (31 хв) дрон дозволить з висоти зробити ідеальний знімок.',
            category_id: getCategoryIdSubquery('Дрони'),
        },
        {
            title: 'Квадрокоптер Autel EVO Lite+ Premium Bundle Orange (102000720)',
            price: 55999,
            initial_image_url: generateImageUrlByUUID(
                'f5bf437d-f4a8-42f2-a377-290d6a52b317'
            ),
            additional_image_url: generateImageUrlByUUID(
                'f7479356-b340-448f-90f1-ff5785b01ab2'
            ),
            quantity_in_stock: 194,
            short_description:
                'Квадрокоптер EVO Lite+ оснащений 1-дюймовим CMOS-датчиком камери та інтелектуальним алгоритмом місячного світла Autel, що дозволяє захоплювати чіткі, яскраві деталі вночі з низьким рівнем шуму – навіть при високому значенні ISO.',
            category_id: getCategoryIdSubquery('Дрони'),
        },
        {
            title: 'Квадрокоптер DJI Matrice 30T (CP.EN.00000368.02 / 01)',
            price: 281000,
            initial_image_url: generateImageUrlByUUID(
                '55b36dd7-30d7-48d3-808c-f8becc060917'
            ),
            additional_image_url: generateImageUrlByUUID(
                '07c2973f-3e9f-42b7-a16c-a06ce2b8fcbe'
            ),
            quantity_in_stock: 40,
            short_description:
                'Баланс потужності та портативності забезпечує більш високу ефективність роботи. Вбудовані вдосконалені системи резервування допомагають підтримувати виконання важливих завдань навіть у несподіваних сценаріях. Компактна і складна, серія M30 легко упаковується, переноситься і розгортається.',
            category_id: getCategoryIdSubquery('Дрони'),
        },
    ]);
}

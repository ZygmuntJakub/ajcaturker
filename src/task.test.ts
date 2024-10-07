import test, { ExecutionContext } from 'ava';

import { CORRECT } from './correctResult';
import { Category, getCategories } from './mockedApi';
import { categoryTree as categoryTreeOld } from './oldSolutionWithFix';
import { CategoryListElement, categoryTree } from './task';

test('compare solution with CORRECT answer', async (t) => {
  // given when
  const result = await categoryTree(getCategories);

  // then
  t.deepEqual(result, CORRECT);
});

const CASES: {
  name: string;
  input: Category[];
  assert: (result: CategoryListElement[], t: ExecutionContext<unknown>) => void;
}[] = [
  {
    name: 'Root is undefined',
    input: undefined,
    assert: (result, t) => {
      t.is(result.length, 0, 'Root is empty');
    },
  },
  {
    name: 'Root is empty',
    input: [],
    assert: (result, t) => {
      t.is(result.length, 0, 'Root is empty');
    },
  },
  {
    name: 'Root length is 5',
    input: Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Category ${i}`,
      MetaTagDescription: `MetaTagDescription ${i}`,
      Title: `Title ${i}`,
      children: [],
      hasChildren: false,
      url: `url ${i}`,
    })),
    assert: (result: CategoryListElement[], t) => {
      t.is(result.length, 5, 'Root length is 5');
      t.true(
        result.every((r) => r.showOnHome),
        'All categories are shown on home'
      );
      t.true(
        result.every((r) => r.children.length === 0),
        'All categories have no children'
      );
      t.true(
        result.every((r, i) => r.order === i),
        'All categories are in order'
      );
    },
  },
  {
    name: 'Root has one marked category',
    input: [
      ...Array.from({ length: 5 }, (_, i) => ({
        id: i,
        name: `Category ${i}`,
        MetaTagDescription: `MetaTagDescription ${i}`,
        Title: `Title ${i}`,
        children: [],
        hasChildren: false,
        url: `url ${i}`,
      })),
      {
        id: 5,
        name: 'Category 5',
        MetaTagDescription: 'MetaTagDescription 5',
        Title: '5#',
        children: [],
        hasChildren: false,
        url: 'url 5',
      },
    ],
    assert: (result: CategoryListElement[], t) => {
      t.is(result.length, 6, 'Root length is 6');
      t.true(
        result.filter((r) => r.showOnHome).length === 1,
        'One category is shown on home'
      );
      t.true(
        result.every((r) => r.children.length === 0),
        'All categories have no children'
      );
      t.true(
        result.every((r, i) => r.order === i),
        'All categories are in order'
      );
    },
  },
  {
    name: 'Root has ten categories',
    input: Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: `Category ${i}`,
      MetaTagDescription: `MetaTagDescription ${i}`,
      Title: `Title ${i}`,
      children: [],
      hasChildren: false,
      url: `url ${i}`,
    })),
    assert: (result: CategoryListElement[], t) => {
      t.is(result.length, 10, 'Root length is 4');
      t.is(
        result.filter((r) => r.showOnHome).length,
        3,
        'Three categories are shown on home'
      );
      t.true(
        result.every((r) => r.children.length === 0),
        'All categories have no children'
      );
      t.true(
        result.every((r, i) => r.order === i),
        'All categories are in order'
      );
    },
  },
  {
    name: 'Root has children',
    input: [
      {
        id: 0,
        name: 'Category 0',
        MetaTagDescription: 'MetaTagDescription 0',
        Title: 'Title 0',
        children: [
          {
            id: 1,
            name: 'Category 1',
            MetaTagDescription: 'MetaTagDescription 1',
            Title: 'Title 1',
            children: [],
            hasChildren: false,
            url: 'url 1',
          },
        ],
        hasChildren: true,
        url: 'url 0',
      },
    ],
    assert: (result: CategoryListElement[], t) => {
      t.is(result.length, 1, 'Root length is 1');
      t.is(
        result.filter((r) => r.showOnHome).length,
        1,
        'One category is shown on home'
      );
      t.is(
        result[0].children.filter((r) => r.showOnHome).length,
        0,
        'Child is not shown on home'
      );
      t.is(result[0].children.length, 1, 'Root has one child');
      t.is(result[0].children[0].children.length, 0, 'Child has no children');
      t.true(
        result.every((r, i) => r.order === i),
        'All categories are in order'
      );
    },
  },
  {
    name: 'Category title is valid order with mark',
    input: [
      {
        id: 1,
        name: 'Category 1',
        MetaTagDescription: 'MetaTagDescription 1',
        Title: '2#3',
        children: [],
        hasChildren: false,
        url: 'url 1',
      },
    ],
    assert: (result: CategoryListElement[], t) => {
      t.is(result[0].order, 2);
    },
  },
  {
    name: 'Category title is valid order without mark',
    input: [
      {
        id: 1,
        name: 'Category 1',
        MetaTagDescription: 'MetaTagDescription 1',
        Title: '2',
        children: [],
        hasChildren: false,
        url: 'url 1',
      },
    ],
    assert: (result: CategoryListElement[], t) => {
      t.is(result[0].order, 2);
    },
  },
  {
    name: 'Category title is not valid order',
    input: [
      {
        id: 1,
        name: 'Category 1',
        MetaTagDescription: 'MetaTagDescription 1',
        Title: 'test#3',
        children: [],
        hasChildren: false,
        url: 'url 1',
      },
    ],
    assert: (result: CategoryListElement[], t) => {
      t.is(result[0].order, 1);
    },
  },
];

CASES.forEach(({ name, input, assert }) => {
  test(name, async (t) => {
    // given
    const getData = () => Promise.resolve({ data: input });

    // when
    const result = await categoryTree(getData);
    const oldResult = await categoryTreeOld(getData);

    // then
    t.snapshot(result);
    assert(result, t);
    assert(oldResult, t);
    t.deepEqual(result, oldResult);
  });
});

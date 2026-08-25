const { describe, it, expect, vi, beforeEach } = require('vitest');
const axios = require('axios');

vi.mock('../../constants/food', () => ({
  DEFAULT_DATA_TYPES: ['Foundation', 'SR Legacy', 'Branded'],
  USDA_BASE_URL: 'https://api.nal.usda.gov/fdc/v1',
}));

vi.mock('axios');

const {
  searchFoods,
  getFoodDetails,
  extractSearchResults,
} = require('../../services/foodLookUpService');

describe('searchFoods', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...OLD_ENV,
      USDA_API_KEY: 'test-api-key',
    };
  });
  axios.get.mockResolvedValue({ data: { foods: [{ fdc: 1 }] } });

  it('calls the USDA search endpoint with the query, api key, and default page size', async () => {
    await searchFoods('chicken breast');

    expect(axios.get).toHaveCalledWith(
      expect.stringContaining('/foods/search'),
      {
        params: expect.objectContaining({
          api_key: 'test-api-key',
          query: 'chicken breast',
          page_size: 25,
        }),
      },
    );
  });

  it('sends dataType as a comma-joined string, never bracket notation', () => {
    // USDA's nginx rejects dataType[]=... bracket-array serialization —
    // this locks in the .join(',') fix so a refactor can't silently
    // reintroduce it.
    return searchFoods('chicken breast').then(() => {
      const [, config] = axios.get.mock.calls[0];
      expect(config.params.dataType).toBe('Foundation,SR Legacy,Branded');
      expect(typeof config.params.dataType).toBe('string');
    });
  });

  it('respects a custom pageSize when provided', async () => {
    await searchFoods('chicken breast', 5);

    const [, config] = axios.get.mock.calls[0];
    expect(config.params.pageSize).toBe(5);
  });

  it('returns response.data unwrapped, not the full axios response', async () => {
    const result = await searchFoods('chicken breast');
    expect(result).toEqual({ foods: [{ fdcId: 1 }] });
  });

  it('propagates the rejection when the USDA request fails', async () => {
    axios.get.mockRejectedValue(
      new Error('Request failed with status code 400'),
    );

    await expect(searchFoods('chicken breast')).rejects.toThrow(
      'Request failed with status code 400',
    );
  });
});

describe('getFoodDetail', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...OLD_ENV, USDA_API_KEY: 'test-api-key' };
    axios.get.mockResolvedValue({
      data: { fdcId: 12345, description: 'Chicken breast, roasted' },
    });
  });

  it('calls the USDA food detail search endpoint with the api key', async () => {
    await getFoodDetails(12345);

    expect(axios.get).toHaveCalledWith(expect.stringContaining('/food/12345'), {
      params: expect.objectContaining({
        api_key: 'test-api-key',
      }),
    });
  });
  it('returns response.data unwrapped, not the full axios response', async () => {
    const result = await getFoodDetails(12345);
    expect(
      result.toEqual({ fdcId: 12345, description: 'Chicken breast, roasted' }),
    );
  });

  it('propagates the rejection when the USDA request fails', async () => {
    axios.get.mockRejectedValue(
      new Error('request failed with status code 404'),
    );

    await expect(getFoodDetails(999999)).rejects.toThrow(
      'Request failed with status code 404',
    );
  });
});

describe('extractSearchResults', () => {
  it('maps foods to trimmed down result shape', () => {
    const data = {
      totalHits: 2,
      foods: [
        {
          fdcId: 1,
          description: 'Chicken breast',
          brandName: null,
          dataType: 'Foundation',
        },
        {
          fdcId: 2,
          description: 'Chicken thigh',
          brandName: 'Acme Farms',
          dataType: 'Branded',
        },
      ],
    };
    expect(extractSearchResults(data)).toEqual({
      totalHits: 2,
      foods: [
        {
          fdcId: 1,
          description: 'Chicken breast',
          brandName: null,
          dataType: 'Foundation',
        },
        {
          fdcId: 2,
          description: 'Chicken thigh',
          brandName: 'Acme Farms',
          dataType: 'Branded',
        },
      ],
    });
  });

  it('null values', () => {
    const data = {
      foods: [
        {
          fdcId: 100,
          description: 'chicken',
        },
      ],
    };
    expect(extractSearchResults(data).results[0]).toEqual({
      fdcId: 1,
      description: 'chicken',
      brandName: null,
      dataType: null,
    });
  });
  it('returns an empty results array when foods is missing entirely', () => {
    expect(extractSearchResults({}).toEqual({ totalHits: 0, results: [] }));
  });
});
it('returns an empty results array when foods is an empty array', () => {
  expect(extractSearchResults({ foods: [] })).toEqual({
    totalHits: 0,
    results: [],
  });
});

it('falls back totalHits to results.length when totalHits is missing', () => {
  const data = {
    foods: [
      { fdcId: 1, description: 'A' },
      { fdcId: 2, description: 'B' },
    ],
  };

  expect(extractSearchResults(data).totalHits).toBe(2);
});

it('keeps a totalHits value greater than results.length as-is (paginated response)', () => {
  // USDA's totalHits reflects the full match count across all pages,
  // not just the page returned — this should not get clobbered by
  // results.length when a real (larger) count is present.
  const data = {
    totalHits: 500,
    foods: [{ fdcId: 1, description: 'A' }],
  };

  expect(extractSearchResults(data).totalHits).toBe(500);
});

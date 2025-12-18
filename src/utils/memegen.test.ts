import { describe, it, expect } from 'vitest';
import { encodeMemeText, buildMemeUrl } from './memegen.js';

describe('encodeMemeText', () => {
  it('should replace spaces with underscores', () => {
    expect(encodeMemeText('hello world')).toBe('hello_world');
  });

  it('should return underscore for empty string', () => {
    expect(encodeMemeText('')).toBe('_');
    expect(encodeMemeText('   ')).toBe('_');
  });

  it('should encode special characters', () => {
    expect(encodeMemeText('what?')).toBe('what~q');
    expect(encodeMemeText('100%')).toBe('100~p');
    expect(encodeMemeText('hashtag#tag')).toBe('hashtag~htag');
    expect(encodeMemeText('path/to/file')).toBe('path~sto~sfile');
    expect(encodeMemeText('back\\slash')).toBe('back~bslash');
  });

  it('should escape literal underscores and dashes', () => {
    expect(encodeMemeText('some_variable')).toBe('some__variable');
    expect(encodeMemeText('kebab-case')).toBe('kebab--case');
  });

  it('should handle multiple special characters', () => {
    expect(encodeMemeText('what? 100%')).toBe('what~q_100~p');
    expect(encodeMemeText('file_name-v2.txt')).toBe('file__name--v2.txt');
  });

  it('should handle complex mixed text', () => {
    const input = 'Change my mind: AI is 100% correct?';
    const expected = 'Change_my_mind:_AI_is_100~p_correct~q';
    expect(encodeMemeText(input)).toBe(expected);
  });

  it('should handle text with underscores and spaces', () => {
    expect(encodeMemeText('var_name in code')).toBe('var__name_in_code');
  });

  it('should handle text with dashes and spaces', () => {
    expect(encodeMemeText('CSS-in-JS is cool')).toBe('CSS--in--JS_is_cool');
  });

  it('should preserve other punctuation', () => {
    expect(encodeMemeText('Hello, world!')).toBe('Hello,_world!');
    expect(encodeMemeText('Yes. No.')).toBe('Yes._No.');
  });
});

describe('buildMemeUrl', () => {
  it('should build a valid URL with basic text', () => {
    const url = buildMemeUrl('drake', 'Old thing', 'New thing');
    expect(url).toBe(
      'https://api.memegen.link/images/drake/Old_thing/New_thing.png'
    );
  });

  it('should build URL with empty text slots', () => {
    const url = buildMemeUrl('cmm', 'Hot take', '');
    expect(url).toBe('https://api.memegen.link/images/cmm/Hot_take/_.png');
  });

  it('should build URL with special characters', () => {
    const url = buildMemeUrl('pikachu', 'Do something bad', 'Why bad thing happen?');
    expect(url).toBe(
      'https://api.memegen.link/images/pikachu/Do_something_bad/Why_bad_thing_happen~q.png'
    );
  });

  it('should handle complex meme text', () => {
    const url = buildMemeUrl(
      'db',
      'Current girlfriend',
      'New girl: 100% trouble?'
    );
    expect(url).toBe(
      'https://api.memegen.link/images/db/Current_girlfriend/New_girl:_100~p_trouble~q.png'
    );
  });

  it('should handle text with underscores', () => {
    const url = buildMemeUrl('pigeon', 'A butterfly', 'Is this a_variable?');
    expect(url).toBe(
      'https://api.memegen.link/images/pigeon/A_butterfly/Is_this_a__variable~q.png'
    );
  });

  it('should handle text with dashes', () => {
    const url = buildMemeUrl('drake', 'REST-API', 'GraphQL-API');
    expect(url).toBe(
      'https://api.memegen.link/images/drake/REST--API/GraphQL--API.png'
    );
  });
});

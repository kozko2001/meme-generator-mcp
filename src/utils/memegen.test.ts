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
  it('should build a valid URL with 2-slot template', () => {
    const url = buildMemeUrl('drake', ['Old thing', 'New thing']);
    expect(url).toBe(
      'https://api.memegen.link/images/drake/Old_thing/New_thing.png'
    );
  });

  it('should build URL with 1-slot template', () => {
    const url = buildMemeUrl('dragon', ['OK I want a boyfriend']);
    expect(url).toBe('https://api.memegen.link/images/dragon/OK_I_want_a_boyfriend.png');
  });

  it('should build URL with 3-slot template', () => {
    const url = buildMemeUrl('db', ['Socialism', 'The Youth', 'Capitalism']);
    expect(url).toBe(
      'https://api.memegen.link/images/db/Socialism/The_Youth/Capitalism.png'
    );
  });

  it('should build URL with 4-slot template', () => {
    const url = buildMemeUrl('gb', ['Who', 'Whom', "Whom'st", "Whomst'd"]);
    expect(url).toBe(
      "https://api.memegen.link/images/gb/Who/Whom/Whom'st/Whomst'd.png"
    );
  });

  it('should build URL with empty text slots', () => {
    const url = buildMemeUrl('aag', ['', 'aliens']);
    expect(url).toBe('https://api.memegen.link/images/aag/_/aliens.png');
  });

  it('should build URL with special characters', () => {
    const url = buildMemeUrl('fry', ['not sure if trolling', 'or just stupid']);
    expect(url).toBe(
      'https://api.memegen.link/images/fry/not_sure_if_trolling/or_just_stupid.png'
    );
  });

  it('should handle complex meme text with special chars', () => {
    const url = buildMemeUrl('morpheus', ['what if I told you that', 'reality was an illusion?']);
    expect(url).toBe(
      'https://api.memegen.link/images/morpheus/what_if_I_told_you_that/reality_was_an_illusion~q.png'
    );
  });

  it('should handle text with underscores', () => {
    const url = buildMemeUrl('iw', ['does testing', 'in production']);
    expect(url).toBe(
      'https://api.memegen.link/images/iw/does_testing/in_production.png'
    );
  });

  it('should handle text with dashes', () => {
    const url = buildMemeUrl('drake', ['REST-API', 'GraphQL-API']);
    expect(url).toBe(
      'https://api.memegen.link/images/drake/REST--API/GraphQL--API.png'
    );
  });

  it('should handle 8-slot template', () => {
    const url = buildMemeUrl('ptj', [
      'Cast it',
      'Cast it',
      'into',
      'into',
      'the fire',
      'the fire',
      'Cast it into the fire.',
      'Keep the Ring of Power!',
    ]);
    expect(url).toBe(
      'https://api.memegen.link/images/ptj/Cast_it/Cast_it/into/into/the_fire/the_fire/Cast_it_into_the_fire./Keep_the_Ring_of_Power!.png'
    );
  });
});

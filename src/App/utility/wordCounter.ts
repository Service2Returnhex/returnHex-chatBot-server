export const countWords = (text: string): number => {
  return text
    .trim()                      
    .split(/\s+/)                
    .filter(word => word.length)
    .length;
  }
/**
 * Generate URL-friendly slug from text
 */
export class SlugUtil {
  static generate(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate unique slug by appending number if slug already exists
   */
  static async generateUnique(
    text: string,
    checkExists: (slug: string) => Promise<boolean>
  ): Promise<string> {
    const baseSlug = this.generate(text);
    let slug = baseSlug;
    let counter = 1;

    while (await checkExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
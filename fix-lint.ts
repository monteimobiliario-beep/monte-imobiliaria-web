import fs from 'fs';
const files = ['views/HomeView.tsx', 'views/PropertyListView.tsx', 'views/CatalogView.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/let mc = \{\};/g, 'let mc: any = {};');
  fs.writeFileSync(file, content);
}

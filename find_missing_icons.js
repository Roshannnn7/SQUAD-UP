
const fs = require('fs');
const path = require('path');

const files = [
    'Frontend/app/profile/page.jsx',
    'Frontend/app/profile/[id]/page.jsx',
    'Frontend/app/dashboard/student/page.jsx',
    'Frontend/app/dashboard/mentor/page.jsx',
    'Frontend/app/dashboard/admin/page.jsx',
    'Frontend/components/Notifications.jsx',
    'Frontend/components/Navbar.jsx',
    'Frontend/components/ConnectionButton.jsx'
];

files.forEach(file => {
    const fullPath = path.resolve('c:/Users/roshan rathod/OneDrive/Desktop/Projects/SQUAD UP', file);
    if (!fs.existsSync(fullPath)) return;

    const content = fs.readFileSync(fullPath, 'utf8');
    const imports = content.match(/import\s*{([^}]+)}\s*from\s*['"]react-icons\/fi['"]/);
    if (!imports) return;

    const importedIcons = imports[1].split(',').map(i => i.trim());
    const usedIcons = content.match(/<Fi[A-Z][a-zA-Z0-9]*/g);
    if (!usedIcons) return;

    const uniqueUsed = [...new Set(usedIcons.map(i => i.substring(1)))];

    uniqueUsed.forEach(icon => {
        if (!importedIcons.includes(icon)) {
            // Check if it's defined in the file
            const isDefined = content.includes(`function ${icon}`) || content.includes(`const ${icon} =`);
            if (!isDefined) {
                console.log(`Missing import in ${file}: ${icon}`);
            }
        }
    });
});

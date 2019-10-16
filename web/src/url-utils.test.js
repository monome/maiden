import 'jest'
import * as urlUtils from './url-utils'

describe('url-utils', () => {
    describe('resourceToEditPath', () => {
        it('returns edit fragment for valid dust resource', () => {
            const result = urlUtils.resourceToEditPath('/api/v1/dust/a/b.lua');
            expect(result).toBe('#edit/dust/a/b.lua');
        });

        it('returns null for invalid dust resource', () => {
            const result = urlUtils.resourceToEditPath('/api/v1/secret.lua');
            expect(result).toBeNull();
        });
    });

    describe('pathToResource', () => {
        it('returns resource path for valid edit path fragment', () => {
            const result = urlUtils.pathToResource('#edit/dust/one/two.lua');
            expect(result).toBe('/api/v1/dust/one/two.lua');
        })

        it('returns null for invalid edit path', () => {
            const result = urlUtils.pathToResource('/api/v1/secret.lua');
            expect(result).toBeNull();
        });
    });

    describe('isEditPath', () => {
        it('returns true when prefix is "edit"', () => {
            const result = urlUtils.isEditPath('edit/anything');
            expect(result).toBe(true);
        });

        it('returns true when prefix is something besides "edit"', () => {
            const result = urlUtils.isEditPath('not-edit/anything');
            expect(result).toBe(false);
        });
    })

    describe('inSameDir', () => {
        it('returns true for resources in the same dir', () => {
            const result = urlUtils.inSameDir('one/two', 'one/three');
            expect(result).toBe(true);
        });
        it('returns true for same dir with extra slashes', () => {
            const result = urlUtils.inSameDir('one//two', 'one/three');
            expect(result).toBe(true);
        });

        it('returns false for resources not in the same dir', () => {
            const result = urlUtils.inSameDir('one/two', 'four/two');
            expect(result).toBe(false);
        });
    })
});

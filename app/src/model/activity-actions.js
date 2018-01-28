export const ACTIVITY_SELECT = 'ACTIVITY_SELECT'

//
// sync actions
//

export const activitySelect = (activity) => {
    return { type: ACTIVITY_SELECT, activity }
}
